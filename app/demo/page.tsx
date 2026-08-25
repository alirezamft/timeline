import type { Metadata } from "next";
import { TradePortfolioDemo } from "@/components/trade-portfolio-demo";

export const metadata: Metadata = {
  title: "Trade Portfolio Demo | رودمپ دامین ترید",
  description: "دموی تعاملی مدیریت پورتفولیو، رودمپ ۱۸ماهه و گزارش زنده دامین Trade",
  robots: { index: false, follow: false }
};

export default function TradePortfolioDemoPage() {
  return <TradePortfolioDemo />;
}
