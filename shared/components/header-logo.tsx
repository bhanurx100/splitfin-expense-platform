import Image from "next/image";
import Link from "next/link";

export const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="flex items-center">
        <Image src="/logo.svg" alt="Finance logo" height={28} width={28} />

        <p className="ml-2.5 text-2xl font-semibold text-white">SpendWise</p>
      </div>
    </Link>
  );
};
