import { useState } from "react";
import { ChefHat, Truck, Users, Send, Briefcase } from "lucide-react";
import { useCreateApplication } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { value: "chef", label: "Chef", icon: ChefHat, description: "Prepare delicious meals in our partner restaurants" },
  { value: "delivery_rider", label: "Delivery Rider", icon: Truck, description: "Deliver food to customers across Ibadan" },
  { value: "manager", label: "Manager", icon: Users, description: "Oversee restaurant operations and team" },
];

export default function Careers() {
  const [filter, setFilter] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    portfolioLink: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const createApplication = useCreateApplication();
  const { toast } = useToast();

  const filteredRoles = filter ? roles.filter((r) => r.value === filter) : roles;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.role) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createApplication.mutate(
      {
        data: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role as "chef" | "delivery_rider" | "manager",
          portfolioLink: formData.portfolioLink || undefined,
          message: formData.message || undefined,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast({ title: "Application submitted!", description: "We'll review your application and get back to you soon." });
        },
        onError: () => {
          toast({ title: "Submission failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-secondary/10 via-background to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Briefcase className="w-4 h-4" /> We're hiring
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Join Our Team</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Be part of the fastest growing food delivery platform in Ibadan. We value passion, dedication, and a love for great food.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Open Positions</h2>
            <div className="flex gap-2">
              <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => setFilter("")} data-testid="button-filter-all-roles">
                All
              </Button>
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant={filter === role.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(role.value)}
                  data-testid={`button-filter-${role.value}`}
                >
                  {role.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {filteredRoles.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.value} className="rounded-xl border bg-card p-6 hover:shadow-md transition-all duration-200" data-testid={`card-role-${role.value}`}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">{role.label}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{role.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setFormData({ ...formData, role: role.value });
                      document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    data-testid={`button-apply-${role.value}`}
                  >
                    Apply Now
                  </Button>
                </div>
              );
            })}
          </div>

          <div id="application-form" className="max-w-2xl mx-auto">
            <div className="rounded-xl border bg-card p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-6">Application Form</h2>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground">Thank you for your interest. We'll review your application and contact you soon.</p>
                  <Button className="mt-6" onClick={() => { setSubmitted(false); setFormData({ fullName: "", email: "", phone: "", role: "", portfolioLink: "", message: "" }); }} data-testid="button-apply-again">
                    Submit Another Application
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" placeholder="Your full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required data-testid="input-fullname" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required data-testid="input-email" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" placeholder="+234 801 234 5678" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required data-testid="input-phone" />
                    </div>
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Portfolio / CV Link</Label>
                    <Input id="portfolio" placeholder="https://your-portfolio.com" value={formData.portfolioLink} onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })} data-testid="input-portfolio" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Tell us about yourself and why you want to join..." rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} data-testid="input-message" />
                  </div>
                  <Button type="submit" className="w-full gap-2" size="lg" disabled={createApplication.isPending} data-testid="button-submit-application">
                    {createApplication.isPending ? "Submitting..." : "Submit Application"} <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
