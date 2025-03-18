import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { WeatherDisplay } from "@/components/weather/weather-display";
import { MaintenanceCalendar } from "@/components/maintenance/maintenance-calendar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard - LawnSync",
  description: "Manage your lawn care business",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  try {
    const lawnProfile = await db.lawnProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return (
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8">
          Welcome back, {session.user?.name || "User"}!
        </h1>
        <div className="grid gap-6">
          {!lawnProfile ? (
            <div className="rounded-lg border p-8 bg-muted/50">
              <h2 className="text-2xl font-semibold mb-4">
                Set Up Your Lawn Profile
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your lawn profile to get personalized care recommendations
                based on your lawn&apos;s specific needs.
              </p>
              <Button asChild>
                <Link href="/dashboard/profile">Create Lawn Profile</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Your Lawn Profile</h2>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/profile">Edit Profile</Link>
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="text-lg">{lawnProfile.size} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grass Type</p>
                    <p className="text-lg">{lawnProfile.grassType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sun Exposure</p>
                    <p className="text-lg">{lawnProfile.sunExposure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-lg">{lawnProfile.location}</p>
                  </div>
                </div>
              </div>
              {/* Weather Display */}
              <div className="mt-6">
                <WeatherDisplay location={lawnProfile.location} />
              </div>
              {/* Maintenance Calendar */}
              <div className="mt-6">
                <h2 className="text-2xl font-semibold mb-4">Maintenance Schedule</h2>
                <MaintenanceCalendar lawnProfileId={lawnProfile.id} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching lawn profile:", error);
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8">
          Welcome back, {session.user?.name || "User"}!
        </h1>
        <div className="rounded-lg border p-8 bg-destructive/10">
          <h2 className="text-2xl font-semibold mb-4 text-destructive">
            Error Loading Profile
          </h2>
          <p className="text-muted-foreground mb-6">
            There was an error loading your lawn profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}