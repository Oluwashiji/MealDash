import { Link } from "wouter";
import { UtensilsCrossed, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Meal<span className="text-primary">Dash</span>
              </span>
            </div>
            <p className="text-sm opacity-70">
              Your favorite food, delivered fast. Serving Ibadan with the best restaurants and campus eateries.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link href="/restaurants" className="hover:text-primary transition-colors" data-testid="link-footer-restaurants">Restaurants</Link></li>
              <li><Link href="/orders" className="hover:text-primary transition-colors" data-testid="link-footer-orders">My Orders</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors" data-testid="link-footer-careers">Join Our Team</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Contact</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Ibadan, Nigeria
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +234 801 234 5678
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> hello@mealdash.ng
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Hours</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li>Mon - Fri: 8am - 10pm</li>
              <li>Saturday: 9am - 11pm</li>
              <li>Sunday: 10am - 9pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm opacity-50">
          2025 MealDash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
