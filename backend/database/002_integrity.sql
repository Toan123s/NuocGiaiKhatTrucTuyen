-- Kiểm tra ở DATABASE. Service vẫn phải validate/JWT/quyền sở hữu và điều phối transaction.
-- Không gọi gateway, không tự giữ/hoàn tồn và không tự đánh dấu PAID ở trigger.
CREATE OR REPLACE FUNCTION check_product_options() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE item jsonb;
BEGIN
 IF btrim(NEW.name) = '' OR btrim(NEW.category) = '' THEN
  RAISE EXCEPTION 'Tên và loại sản phẩm không được rỗng' USING ERRCODE='23514';
 END IF;
 IF jsonb_typeof(NEW.sizes) <> 'array' OR jsonb_array_length(NEW.sizes) = 0 OR jsonb_typeof(NEW.toppings) <> 'array' THEN
  RAISE EXCEPTION 'sizes/toppings phải là mảng, sizes không rỗng' USING ERRCODE='23514';
 END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(NEW.sizes) LOOP
  IF NOT (item ? 'name' AND item ? 'extraPrice') OR NOT coalesce(item->>'name' IN ('S','M','L'),false) OR
   jsonb_typeof(item->'extraPrice') IS DISTINCT FROM 'number' OR NOT ((item->>'extraPrice') ~ '^[0-9]+$') THEN
   RAISE EXCEPTION 'Size hoặc giá cộng thêm không hợp lệ' USING ERRCODE='23514';
  END IF;
 END LOOP;
 IF (SELECT count(*) <> count(DISTINCT x->>'name') FROM jsonb_array_elements(NEW.sizes) x) THEN
  RAISE EXCEPTION 'Size bị trùng' USING ERRCODE='23514';
 END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(NEW.toppings) LOOP
  IF NOT (item ? 'id' AND item ? 'name' AND item ? 'price') OR coalesce(btrim(item->>'id'),'')='' OR
   coalesce(btrim(item->>'name'),'')='' OR jsonb_typeof(item->'price') IS DISTINCT FROM 'number' OR NOT ((item->>'price') ~ '^[0-9]+$') THEN
   RAISE EXCEPTION 'Topping không hợp lệ' USING ERRCODE='23514';
  END IF;
 END LOOP;
 IF (SELECT count(*) <> count(DISTINCT x->>'id') FROM jsonb_array_elements(NEW.toppings) x) THEN
  RAISE EXCEPTION 'Mã topping bị trùng' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS products_options_guard ON products;
CREATE TRIGGER products_options_guard BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION check_product_options();

CREATE OR REPLACE FUNCTION guard_order_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  IF OLD.status IN ('PAID','PREPARING','READY','COMPLETED') THEN
   RAISE EXCEPTION 'Không xóa vật lý đơn đã thanh toán' USING ERRCODE='23514';
  END IF;
  RETURN OLD;
 END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.created_txid <> txid_current() THEN RAISE EXCEPTION 'created_txid phải là transaction hiện tại' USING ERRCODE='23514'; END IF;
  IF NEW.status <> 'PENDING' THEN RAISE EXCEPTION 'Đơn mới phải PENDING' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 END IF;
 IF NEW.created_txid IS DISTINCT FROM OLD.created_txid OR NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR
  NEW.subtotal IS DISTINCT FROM OLD.subtotal OR NEW.discount IS DISTINCT FROM OLD.discount OR
  NEW.total IS DISTINCT FROM OLD.total OR NEW.promotion_id IS DISTINCT FROM OLD.promotion_id OR
  NEW.created_at IS DISTINCT FROM OLD.created_at THEN
  RAISE EXCEPTION 'Không sửa chủ đơn hoặc giá chốt; hủy và tạo đơn mới' USING ERRCODE='23514';
 END IF;
 IF NEW.status <> OLD.status AND NOT (
  (OLD.status='PENDING' AND NEW.status IN ('PAID','PAYMENT_FAILED','CANCELLED')) OR
  (OLD.status='PAYMENT_FAILED' AND NEW.status IN ('PENDING','CANCELLED')) OR
  (OLD.status='PAID' AND NEW.status='PREPARING') OR
  (OLD.status='PREPARING' AND NEW.status='READY') OR
  (OLD.status='READY' AND NEW.status='COMPLETED')
 ) THEN RAISE EXCEPTION 'Chuyển trạng thái đơn không hợp lệ: % -> %', OLD.status, NEW.status USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS orders_change_guard ON orders;
CREATE TRIGGER orders_change_guard BEFORE INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION guard_order_change();

CREATE OR REPLACE FUNCTION guard_order_item() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_id text; parent_status text; parent_txid bigint; product products;
BEGIN
 parent_id := CASE WHEN TG_OP='DELETE' THEN OLD.order_id ELSE NEW.order_id END;
 SELECT status,created_txid INTO parent_status,parent_txid FROM orders WHERE id=parent_id FOR UPDATE;
 IF parent_status IS NOT NULL AND (parent_txid <> txid_current() OR EXISTS(SELECT 1 FROM payments WHERE order_id=parent_id)) THEN
  RAISE EXCEPTION 'Chi tiết đã chốt; chỉ lập trong transaction tạo đơn trước thanh toán' USING ERRCODE='23514';
 END IF;
 IF parent_status IS NOT NULL AND parent_status <> 'PENDING' THEN
  RAISE EXCEPTION 'Chỉ lập chi tiết khi đơn PENDING' USING ERRCODE='23514';
 END IF;
 IF TG_OP='UPDATE' AND (NEW.order_id <> OLD.order_id OR NEW.id <> OLD.id) THEN
  RAISE EXCEPTION 'Không chuyển chi tiết sang đơn khác' USING ERRCODE='23514';
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 SELECT * INTO product FROM products WHERE id=NEW.product_id;
 IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(product.sizes) x WHERE x->>'name'=NEW.size) THEN
  RAISE EXCEPTION 'Size không thuộc sản phẩm' USING ERRCODE='23514';
 END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.topping_ids) x
   WHERE jsonb_typeof(x) IS DISTINCT FROM 'string' OR NOT EXISTS
   (SELECT 1 FROM jsonb_array_elements(product.toppings) t WHERE t->>'id'=x#>>'{}')) THEN
  RAISE EXCEPTION 'Topping không thuộc sản phẩm' USING ERRCODE='23514';
 END IF;
 IF (SELECT count(*) <> count(DISTINCT x) FROM jsonb_array_elements(NEW.topping_ids) x) THEN
  RAISE EXCEPTION 'Topping trong dòng đơn bị trùng' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS order_items_guard ON order_items;
CREATE TRIGGER order_items_guard BEFORE INSERT OR UPDATE OR DELETE ON order_items FOR EACH ROW EXECUTE FUNCTION guard_order_item();

CREATE OR REPLACE FUNCTION guard_payment_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent orders;
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Không xóa lịch sử thanh toán' USING ERRCODE='23514'; END IF;
 SELECT * INTO parent FROM orders WHERE id=NEW.order_id FOR UPDATE;
 IF TG_OP='INSERT' THEN
  IF NEW.status <> 'PROCESSING' OR parent.status <> 'PENDING' THEN
   RAISE EXCEPTION 'Attempt mới chỉ PROCESSING trên đơn PENDING' USING ERRCODE='23514';
  END IF;
 ELSE
  IF OLD.status <> 'PROCESSING' OR NEW.status NOT IN ('SUCCEEDED','FAILED') OR
   NEW.id IS DISTINCT FROM OLD.id OR NEW.order_id IS DISTINCT FROM OLD.order_id OR
   NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key OR NEW.payload_hash IS DISTINCT FROM OLD.payload_hash OR
   NEW.amount IS DISTINCT FROM OLD.amount OR NEW.method IS DISTINCT FROM OLD.method OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
   RAISE EXCEPTION 'Không sửa attempt cuối hoặc thay key/payload/số tiền' USING ERRCODE='23514';
  END IF;
 END IF;
 IF NEW.amount <> parent.total THEN RAISE EXCEPTION 'Tiền thanh toán khác tổng đơn' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS payments_change_guard ON payments;
CREATE TRIGGER payments_change_guard BEFORE INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION guard_payment_change();

-- Kiểm tra liên bảng tại COMMIT: cho phép ghi Payment + PAID + EARN theo cùng transaction.
CREATE OR REPLACE FUNCTION assert_order_consistency(target_id text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE o orders; lines bigint; item_count bigint; success_count bigint; processing_count bigint; earn_count bigint;
BEGIN
 SELECT * INTO o FROM orders WHERE id=target_id;
 IF NOT FOUND THEN RETURN; END IF;
 SELECT count(*),coalesce(sum(line_total),0) INTO item_count,lines FROM order_items WHERE order_id=o.id;
 IF item_count=0 OR lines<>o.subtotal THEN RAISE EXCEPTION 'Đơn cần chi tiết và subtotal phải bằng tổng dòng' USING ERRCODE='23514'; END IF;
 SELECT count(*) FILTER(WHERE status='SUCCEEDED'),count(*) FILTER(WHERE status='PROCESSING') INTO success_count,processing_count FROM payments WHERE order_id=o.id;
 IF (o.status IN ('PAID','PREPARING','READY','COMPLETED')) <> (success_count=1) THEN
  RAISE EXCEPTION 'Trạng thái đơn không khớp thanh toán thành công' USING ERRCODE='23514';
 END IF;
 SELECT count(*) INTO earn_count FROM loyalty_transactions WHERE order_id=o.id AND type='EARN';
 IF (o.status IN ('PAID','PREPARING','READY','COMPLETED')) <> (earn_count=1) THEN
  RAISE EXCEPTION 'Đơn đã trả tiền phải có đúng một EARN trong cùng transaction' USING ERRCODE='23514';
 END IF;
 IF o.status IN ('PAYMENT_FAILED','CANCELLED') AND processing_count>0 THEN
  RAISE EXCEPTION 'Không hủy/kết luận thất bại khi còn thanh toán PROCESSING' USING ERRCODE='23514';
 END IF;
 IF o.status='PAYMENT_FAILED' AND NOT EXISTS (SELECT 1 FROM payments WHERE order_id=o.id AND status='FAILED') THEN
  RAISE EXCEPTION 'PAYMENT_FAILED cần có attempt thất bại xác định' USING ERRCODE='23514';
 END IF;
 IF o.status IN ('PAYMENT_FAILED','CANCELLED') AND NOT o.stock_released THEN
  RAISE EXCEPTION 'Đơn thất bại/hủy cần đánh dấu đã hoàn tồn' USING ERRCODE='23514';
 END IF;
 IF o.status IN ('PAID','PREPARING','READY','COMPLETED') AND o.stock_released THEN
  RAISE EXCEPTION 'Đơn đã trả tiền không thể đánh dấu đã hoàn tồn' USING ERRCODE='23514';
 END IF;
END $$;
CREATE OR REPLACE FUNCTION check_order_consistency_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_TABLE_NAME='orders' THEN
  PERFORM assert_order_consistency(CASE WHEN TG_OP='DELETE' THEN OLD.id ELSE NEW.id END);
 ELSE
  PERFORM assert_order_consistency(CASE WHEN TG_OP='DELETE' THEN OLD.order_id ELSE NEW.order_id END);
 END IF;
 RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS orders_consistency ON orders;
CREATE CONSTRAINT TRIGGER orders_consistency AFTER INSERT OR UPDATE ON orders DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_order_consistency_trigger();
DROP TRIGGER IF EXISTS items_consistency ON order_items;
CREATE CONSTRAINT TRIGGER items_consistency AFTER INSERT OR UPDATE OR DELETE ON order_items DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_order_consistency_trigger();
DROP TRIGGER IF EXISTS payments_consistency ON payments;
CREATE CONSTRAINT TRIGGER payments_consistency AFTER INSERT OR UPDATE OR DELETE ON payments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_order_consistency_trigger();

CREATE OR REPLACE FUNCTION guard_loyalty_earn() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE o orders;
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'Sổ điểm chỉ được ghi thêm, không sửa/xóa' USING ERRCODE='23514'; END IF;
 SELECT * INTO o FROM orders WHERE id=NEW.order_id FOR UPDATE;
 IF o.user_id IS DISTINCT FROM NEW.user_id OR o.status NOT IN ('PAID','PREPARING','READY','COMPLETED') THEN
  RAISE EXCEPTION 'Chỉ tích điểm cho chủ đơn đã PAID' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS loyalty_guard ON loyalty_transactions;
CREATE TRIGGER loyalty_guard BEFORE INSERT OR UPDATE OR DELETE ON loyalty_transactions FOR EACH ROW EXECUTE FUNCTION guard_loyalty_earn();
-- Điểm tổng cập nhật bởi trigger này; service chỉ INSERT ledger, KHÔNG cộng users lần nữa.
CREATE OR REPLACE FUNCTION add_loyalty_balance() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 UPDATE users SET loyalty_points=loyalty_points+NEW.points WHERE id=NEW.user_id;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS loyalty_balance ON loyalty_transactions;
CREATE TRIGGER loyalty_balance AFTER INSERT ON loyalty_transactions FOR EACH ROW EXECUTE FUNCTION add_loyalty_balance();

-- Từ chối sửa điểm tổng không khớp sổ điểm (kiểm tra cuối transaction).
CREATE OR REPLACE FUNCTION check_user_points_balance() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE uid text; balance bigint; ledger bigint;
BEGIN
 IF TG_TABLE_NAME='users' THEN uid:=NEW.id; ELSE uid:=NEW.user_id; END IF;
 SELECT loyalty_points INTO balance FROM users WHERE id=uid;
 SELECT coalesce(sum(points),0) INTO ledger FROM loyalty_transactions WHERE user_id=uid;
 IF balance IS DISTINCT FROM ledger THEN RAISE EXCEPTION 'Điểm tổng không khớp sổ điểm' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS users_points_consistency ON users;
CREATE CONSTRAINT TRIGGER users_points_consistency AFTER INSERT OR UPDATE ON users DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_user_points_balance();
DROP TRIGGER IF EXISTS ledger_points_consistency ON loyalty_transactions;
CREATE CONSTRAINT TRIGGER ledger_points_consistency AFTER INSERT ON loyalty_transactions DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_user_points_balance();
