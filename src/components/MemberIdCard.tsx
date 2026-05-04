import Image from "next/image";
import { Package, CheckCircle2, Clock } from "lucide-react";
import logoSwe from "@/assets/logo-swe.png";

const orders = [
  { name: "Engineering Hoodie", status: "Ready for Pickup", ready: true },
  { name: "SWE Cap — Black Edition", status: "Processing", ready: false },
  { name: "Athletic Shorts Pack", status: "Ready for Pickup", ready: true },
];

const MemberIdCard = () => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden card-glow animate-pulse-gold">
      {/* Header band */}
      <div className="gold-gradient px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src={logoSwe} alt="SWE" width={32} height={32} />
          <span className="font-display font-bold text-primary-foreground text-sm tracking-widest uppercase">
            Carteirinha Digtal de Membro
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground">Alex Chen</h3>
          <p className="text-muted-foreground text-sm mt-1">B.Sc. Software Engineering · Class of 2026</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary">
              Active Member
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              Season 2025/26
            </span>
          </div>
        </div>

        {/* Orders */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Active Orders</h4>
          </div>
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.name}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 border border-border"
              >
                <span className="text-sm text-foreground">{order.name}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${order.ready ? "text-primary" : "text-muted-foreground"}`}>
                  {order.ready ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberIdCard;
