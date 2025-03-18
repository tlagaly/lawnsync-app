import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LawnProfileForm from "@/components/lawn/lawn-profile-form";

export const metadata: Metadata = {
  title: "Lawn Profile - LawnSync",
  description: "Set up your lawn profile",
};

export default function LawnProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-[450px] space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lawn Profile</CardTitle>
            <CardDescription>
              Set up your lawn profile to get personalized care recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LawnProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}