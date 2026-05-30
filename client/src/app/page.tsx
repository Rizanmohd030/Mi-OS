"use client";

import dynamic from "next/dynamic";

const UnlockClient = dynamic(() => import("./unlock/UnlockClient"), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-[#050505]" />
  ),
});

export default function Home() {
  return <UnlockClient nextPath="/Workspace" />;
}
