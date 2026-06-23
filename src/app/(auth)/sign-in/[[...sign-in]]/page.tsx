"use client";

import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader2, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const DEMO_EMAIL = "splitfindemo@gmail.com";
const DEMO_PASSWORD = "Splitfin@demo";

function fillClerkField(selector: string, value: string): boolean {
  const input = document.querySelector<HTMLInputElement>(selector);
  if (!input) return false;

  // Clerk uses React-controlled inputs — must trigger via native value setter
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;

  nativeInputValueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.focus();
  return true;
}

function DemoButton() {
  const [status, setStatus] = useState<"idle" | "filling" | "done">("idle");

  const handleFill = async () => {
    setStatus("filling");
    await new Promise((r) => setTimeout(r, 300));

    // Fill email — Clerk's identifier field
    const emailFilled =
      fillClerkField('input[name="identifier"]', DEMO_EMAIL) ||
      fillClerkField('input[type="email"]', DEMO_EMAIL) ||
      fillClerkField('input[autocomplete="email"]', DEMO_EMAIL);

    if (!emailFilled) {
      setStatus("idle");
      return;
    }

    // Fill password (may be on same screen or appear after email step)
    const tryFillPassword = () =>
      fillClerkField('input[name="password"]', DEMO_PASSWORD) ||
      fillClerkField('input[type="password"]', DEMO_PASSWORD);

    tryFillPassword();
    setTimeout(tryFillPassword, 700); // retry if password field renders after email

    setStatus("done");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <>
      <style>{`
        .demo-wrap {
          width: 100%;
          max-width: 400px;
          margin-bottom: 18px;
        }

        .demo-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 12px;
          border: 1.5px solid #dde3ff;
          background: linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%);
          color: #6366f1;
          font-size: 14px;
          font-weight: 650;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.07);
          letter-spacing: 0.01em;
        }

        .demo-btn::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2.5px;
          background: linear-gradient(90deg, #6366f1, #818cf8, #a5b4fc);
          border-radius: 12px 12px 0 0;
        }

        .demo-btn:hover {
          border-color: #b0b8ff;
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.15);
          transform: translateY(-1px);
        }

        .demo-btn:active {
          transform: translateY(0px) scale(0.99);
        }

        .demo-btn.filling {
          pointer-events: none;
          opacity: 0.8;
        }

        .demo-btn.done {
          border-color: #86efac;
          background: linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%);
          color: #16a34a;
        }

        .demo-btn.done::before {
          background: linear-gradient(90deg, #4ade80, #86efac);
        }

        .demo-hint {
          text-align: center;
          font-size: 11px;
          color: #b0b8cc;
          margin-top: 7px;
          letter-spacing: 0.02em;
        }

        .btn-spin {
          animation: btn-spin 0.7s linear infinite;
        }

        @keyframes btn-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="demo-wrap">
        <button
          onClick={handleFill}
          className={`demo-btn ${status}`}
          disabled={status === "filling"}
        >
          {status === "filling" ? (
            <>
              <Loader2 size={15} className="btn-spin" />
              Filling in credentials…
            </>
          ) : status === "done" ? (
            <>
              <Sparkles size={15} />
              Credentials filled!
            </>
          ) : (
            <>
              <Zap size={15} />
              Use Demo Account
            </>
          )}
        </button>
        <p className="demo-hint">Fills email &amp; password automatically — just hit Sign In</p>
      </div>
    </>
  );
}

const SignInPage = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="h-full flex-col items-center justify-center px-4 lg:flex">
        <div className="space-y-4 pt-16 text-center">
          <h1 className="text-3xl font-bold text-[#2E2A47]">Welcome back!</h1>
          <p className="text-base text-[#7E8CA0]">
            Log in or create account to get back to your dashboard.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center w-full">
          <DemoButton />

          <ClerkLoaded>
            <SignIn path="/sign-in" />
          </ClerkLoaded>

          <ClerkLoading>
            <Loader2 className="animate-spin text-muted-foreground" />
          </ClerkLoading>
        </div>
      </div>

      <div className="hidden h-full items-center justify-center bg-blue-600 lg:flex">
        <Image src="/logo.svg" alt="Finance logo" height={100} width={100} />
      </div>
    </div>
  );
};

export default SignInPage;