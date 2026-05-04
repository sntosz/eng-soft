import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  href: string;
  className?: string;
}

const NavLink = ({ href, className, children, ...props }: NavLinkProps) => {
  return (
    <Link href={href} className={cn(className)} {...props}>
      {children}
    </Link>
  );
};

export { NavLink };
