import type { ReactNode } from "react";

export function Icon({ children, size = 20, className = "" }: { children: ReactNode; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size}>{children}</svg>;
}

export const CartIcon = ({ size = 20 }: { size?: number }) => <Icon size={size}><path d="M3 4h2l2.3 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 7H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><circle cx="9.5" cy="19.5" fill="currentColor" r="1.2" /><circle cx="17.5" cy="19.5" fill="currentColor" r="1.2" /></Icon>;
export const CloseIcon = () => <Icon><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></Icon>;
export const ArrowIcon = ({ left = false }: { left?: boolean }) => <Icon><path d={left ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></Icon>;
export const SearchIcon = () => <Icon><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></Icon>;
export const CheckIcon = ({ size = 20 }: { size?: number }) => <Icon size={size}><path d="m5 12.5 4.2 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></Icon>;
export const ClockIcon = () => <Icon><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></Icon>;
export const UserIcon = () => <Icon><circle cx="12" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.7" /><path d="M5.8 20c.7-3.3 3-5 6.2-5s5.5 1.7 6.2 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></Icon>;
