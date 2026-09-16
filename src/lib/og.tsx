import { ImageResponse } from "next/og";
export function ogImage(
  title: string,
  label = "CYBERSECURITY × SOFTWARE DEVELOPMENT",
) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#101211",
        color: "#f0f2ec",
        padding: "65px 75px",
        fontFamily: "sans-serif",
        borderBottom: "10px solid #c2f970",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 34,
          color: "#c2f970",
          letterSpacing: -1,
        }}
      >
        cybervalue.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 17,
          letterSpacing: 3,
          color: "#a6b399",
          marginTop: 55,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 85 ? 43 : 59,
          lineHeight: 1.16,
          letterSpacing: -2,
          marginTop: 25,
          maxHeight: 250,
          overflow: "hidden",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 21,
          color: "#b5beab",
          marginTop: "auto",
        }}
      >
        Rawshanbek Gayipbaev · Curiosity. Practice. Evidence.
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
