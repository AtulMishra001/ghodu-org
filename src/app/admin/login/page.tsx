import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";
import LoginPanel from "@/components/admin/LoginPanel";
import { photos } from "@/data/photos";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <LoginPanel image={photos.orchard}>
      {/* the form reads ?next= from the URL, which is request-time data */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </LoginPanel>
  );
}
