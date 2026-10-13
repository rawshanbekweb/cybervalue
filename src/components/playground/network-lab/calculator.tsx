"use client";

// The free subnet calculator.

import { useState } from "react";
import { formatIp, parseIp, parseMask, prefixToMask } from "@/lib/network/ip";
import { useT } from "./use-t";
import { BitStrip, Legend, RangeBar, SubnetFacts } from "./basics";

// Free tool: any address and mask, with the full breakdown.
export function SubnetCalculator() {
  const { t } = useT();
  const [address, setAddress] = useState("192.168.1.10");
  const [mask, setMask] = useState("255.255.255.0");
  const ip = parseIp(address);
  const prefix = parseMask(mask);
  return (
    <div className="nl-workspace">
      <header className="nl-lesson-header">
        <div>
          <span className="eyebrow">
            {t("ERKIN MASHQ", "YOUR OWN EXPERIMENTS")}
          </span>
          <h2>{t("Subnet kalkulyator", "Subnet calculator")}</h2>
        </div>
      </header>
      <div className="nl-card nl-calculator">
        <div className="nl-calc-inputs">
          <label className="nl-field">
            <span>{t("IP manzil", "IP address")}</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className="nl-field">
            <span>{t("Mask yoki /prefiks", "Mask or /prefix")}</span>
            <input
              value={mask}
              onChange={(e) => setMask(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        </div>
        {ip === null || prefix === null ? (
          <p className="nl-fail" role="status">
            {ip === null
              ? t(
                  "IP manzil 4 ta 0–255 sondan iborat bo‘lishi kerak.",
                  "An IP address is four numbers from 0 to 255.",
                )
              : t(
                  "Maskni 255.255.255.0 yoki /24 ko‘rinishida yozing; birlar uzluksiz bo‘lishi kerak.",
                  "Write the mask as 255.255.255.0 or /24; its ones must be unbroken.",
                )}
          </p>
        ) : (
          <>
            <RangeBar ip={ip} prefix={prefix} />
            <p className="nl-row-label">IP</p>
            <BitStrip ip={ip} prefix={prefix} label={formatIp(ip)} />
            <p className="nl-row-label">{t("Mask", "Mask")}</p>
            <BitStrip
              ip={prefixToMask(prefix)}
              prefix={prefix}
              label={formatIp(prefixToMask(prefix))}
            />
            <Legend />
            <SubnetFacts ip={ip} prefix={prefix} />
          </>
        )}
      </div>
    </div>
  );
}
