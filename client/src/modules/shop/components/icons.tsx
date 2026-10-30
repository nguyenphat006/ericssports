import type { ComponentType } from "react";
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  ArrowsOutIcon,
  BankIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  ClockIcon,
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  FileTextIcon,
  FlaskIcon,
  FolderOpenIcon,
  HeadsetIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MedalIcon,
  MinusIcon,
  MoneyIcon,
  PackageIcon,
  PencilSimpleIcon,
  PlayIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SignOutIcon,
  SlidersHorizontalIcon,
  StarIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
  WalletIcon,
  WrenchIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon, IconProps, IconWeight } from "@phosphor-icons/react/dist/lib/types";

/**
 * Bộ icon storefront: Phosphor (bản SSR — dùng được cả server lẫn client component, không cần context).
 * Quy ước: icon giao diện (nút, header, mũi tên) = `bold` (mặc định ở đây); icon minh họa (dải lợi ích,
 * danh mục) = truyền `weight="duotone"`; sao / nút phát đã tô = `weight="fill"`.
 * Đổi bộ icon cho cả storefront: chỉ sửa file này (trang quản trị dùng lucide của shadcn, không liên quan).
 */
export type ShopIcon = ComponentType<IconProps>;
export type { IconWeight };

function withWeight(Base: Icon, name: string, weight: IconWeight = "bold"): ShopIcon {
  const Wrapped = (props: IconProps) => <Base weight={weight} aria-hidden {...props} />;
  Wrapped.displayName = name;
  return Wrapped;
}

export const ArrowLeft = withWeight(ArrowLeftIcon, "ArrowLeft");
export const ArrowRight = withWeight(ArrowRightIcon, "ArrowRight");
export const Award = withWeight(MedalIcon, "Award");
export const Banknote = withWeight(MoneyIcon, "Banknote");
export const CheckCircle = withWeight(CheckCircleIcon, "CheckCircle");
export const ChevronDown = withWeight(CaretDownIcon, "ChevronDown");
export const ChevronLeft = withWeight(CaretLeftIcon, "ChevronLeft");
export const ChevronRight = withWeight(CaretRightIcon, "ChevronRight");
export const Clock = withWeight(ClockIcon, "Clock");
export const CreditCard = withWeight(CreditCardIcon, "CreditCard");
export const Eye = withWeight(EyeIcon, "Eye");
export const EyeOff = withWeight(EyeSlashIcon, "EyeOff");
export const FileText = withWeight(FileTextIcon, "FileText");
export const Flask = withWeight(FlaskIcon, "Flask");
export const FolderOpen = withWeight(FolderOpenIcon, "FolderOpen");
export const Headset = withWeight(HeadsetIcon, "Headset");
export const Landmark = withWeight(BankIcon, "Landmark");
export const Spinner = withWeight(CircleNotchIcon, "Spinner");
export const LogOut = withWeight(SignOutIcon, "LogOut");
export const MapPin = withWeight(MapPinIcon, "MapPin");
export const Maximize = withWeight(ArrowsOutIcon, "Maximize");
export const Menu = withWeight(ListIcon, "Menu");
export const Minus = withWeight(MinusIcon, "Minus");
export const Package = withWeight(PackageIcon, "Package");
export const Pencil = withWeight(PencilSimpleIcon, "Pencil");
export const Play = withWeight(PlayIcon, "Play", "fill");
export const Plus = withWeight(PlusIcon, "Plus");
export const RefreshCw = withWeight(ArrowsClockwiseIcon, "RefreshCw");
export const RotateCcw = withWeight(ArrowCounterClockwiseIcon, "RotateCcw");
export const Search = withWeight(MagnifyingGlassIcon, "Search");
export const ShieldCheck = withWeight(ShieldCheckIcon, "ShieldCheck");
export const ShoppingBag = withWeight(ShoppingBagIcon, "ShoppingBag");
export const SlidersHorizontal = withWeight(SlidersHorizontalIcon, "SlidersHorizontal");
/** Sao đánh giá: mặc định tô đặc; sao rỗng truyền `weight="regular"` */
export const Star = withWeight(StarIcon, "Star", "fill");
export const Trash = withWeight(TrashIcon, "Trash");
export const Truck = withWeight(TruckIcon, "Truck");
export const User = withWeight(UserIcon, "User");
export const Wallet = withWeight(WalletIcon, "Wallet");
export const Wrench = withWeight(WrenchIcon, "Wrench");
export const X = withWeight(XIcon, "X");
export const XCircle = withWeight(XCircleIcon, "XCircle");
