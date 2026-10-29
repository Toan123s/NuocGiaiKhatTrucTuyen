-- Map image_url từ products.json vào bảng products trong PostgreSQL.
-- Chạy qua: npm run db:migrate
-- Migration runner tự track checksum — không cần guard thủ công.
-- Chạy lại an toàn: UPDATE chỉ đổi giá trị, không ảnh hưởng hàng khác.

UPDATE products SET image_url = '/images/products/ca-phe-sua.jpg'          WHERE id = 'ca-phe-sua';
UPDATE products SET image_url = '/images/products/bac_xiu.webp'            WHERE id = 'bac-xiu';
UPDATE products SET image_url = '/images/products/americano.jpg'            WHERE id = 'americano';
UPDATE products SET image_url = '/images/products/latte-da.jpg'             WHERE id = 'latte';
UPDATE products SET image_url = '/images/products/tra_dao_cam_sa.jpg'       WHERE id = 'tra-dao';
UPDATE products SET image_url = '/images/products/tra_vai.jpg'              WHERE id = 'tra-vai';
UPDATE products SET image_url = '/images/products/matcha_latte.jpg'         WHERE id = 'matcha-latte';
UPDATE products SET image_url = '/images/products/choco_latte.jpg'          WHERE id = 'chocolate';
UPDATE products SET image_url = '/images/products/espresso.jpg'             WHERE id = 'espresso';
UPDATE products SET image_url = '/images/products/cappuchino.jpg'           WHERE id = 'cappuccino';
UPDATE products SET image_url = '/images/products/cafe_den.webp'            WHERE id = 'ca-phe-den';
UPDATE products SET image_url = '/images/products/cold_brew.jpg'            WHERE id = 'cold-brew';
UPDATE products SET image_url = '/images/products/caramel_latte.jpg'        WHERE id = 'caramel-latte';
UPDATE products SET image_url = '/images/products/Vanilla_Latte.jpg'        WHERE id = 'vanilla-latte';
UPDATE products SET image_url = '/images/products/mocha.jpg'                WHERE id = 'mocha';
UPDATE products SET image_url = '/images/products/cafe_dua.jpeg'            WHERE id = 'ca-phe-dua';
UPDATE products SET image_url = '/images/products/tra_chanh.jpg'            WHERE id = 'tra-chanh';
UPDATE products SET image_url = '/images/products/tra_tac.jpg'              WHERE id = 'tra-tac';
UPDATE products SET image_url = '/images/products/tra_dau.jpg'              WHERE id = 'tra-dau';
UPDATE products SET image_url = '/images/products/tra_xoai.jpg'             WHERE id = 'tra-xoai';
UPDATE products SET image_url = '/images/products/tra_chanh_day.webp'       WHERE id = 'tra-chanh-day';
UPDATE products SET image_url = '/images/products/tra_oi_hong.png'          WHERE id = 'tra-oi-hong';
UPDATE products SET image_url = '/images/products/trasen.jpg'               WHERE id = 'tra-sen';
UPDATE products SET image_url = '/images/products/tra_luu.jpg'              WHERE id = 'tra-luu';
UPDATE products SET image_url = '/images/products/matcha_da_xay.png'        WHERE id = 'matcha-da';
UPDATE products SET image_url = '/images/products/matcha_espresso.png'      WHERE id = 'matcha-espresso';
UPDATE products SET image_url = '/images/products/cacao_nong.jpg'           WHERE id = 'cacao-nong';
UPDATE products SET image_url = '/images/products/sua.jpg'                  WHERE id = 'sua-tuoi';
UPDATE products SET image_url = '/images/products/sua_tuoi_tran_chau.jpeg'  WHERE id = 'sua-tuoi-tran-chau';
UPDATE products SET image_url = '/images/products/soda_chanh.webp'          WHERE id = 'soda-chanh';
UPDATE products SET image_url = '/images/products/soda_vietquoc.jpg'        WHERE id = 'soda-viet-quat';
UPDATE products SET image_url = '/images/products/cam_ep.jpg'               WHERE id = 'nuoc-cam';
UPDATE products SET image_url = '/images/products/nuoc_dua.webp'            WHERE id = 'nuoc-dua';
UPDATE products SET image_url = '/images/products/sua_chua_dau.jpg'         WHERE id = 'yogurt-dau';
UPDATE products SET image_url = '/images/products/sua_chua_xoai.png'        WHERE id = 'yogurt-xoai';
UPDATE products SET image_url = '/images/products/nuoc_khoang.jpg'          WHERE id = 'nuoc-suoi';
