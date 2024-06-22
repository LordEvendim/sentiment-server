import {
  Button,
  Container,
  Font,
  Heading,
  Html,
  Text,
} from "@react-email/components";
import React from "react";

export default function PasswordReset({ link }: { link: string }) {
  return (
    <Html>
      <Font
        fontFamily="Roboto"
        fallbackFontFamily="Verdana"
        webFont={{
          url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Roboto"
        fallbackFontFamily="Verdana"
        webFont={{
          url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
          format: "woff2",
        }}
        fontWeight={700}
        fontStyle="normal"
      />
      <Container
        style={{
          background: "#fafafa",
          padding: "10px",
          width: "full",
          textAlign: "center",
          border: "solid",
          borderWidth: "2px",
          borderColor: "#ccc",
          borderRadius: "5px",
          boxShadow: "-5px 7px 20px -14px rgba(66, 68, 90, 0.5)",
        }}
      >
        <Heading style={{ color: "#555", fontSize: "30px", fontWeight: 700 }}>
          Password reset
        </Heading>
        <Text style={{ color: "#999", fontWeight: 400 }}>
          If you've lost your password or wish to reset it, <br />
          use the button below!
        </Text>
        <Button
          href={link}
          style={{
            background: "#2a59b1",
            color: "#eee",
            padding: "15px 30px",
            margin: "30px 30px",
            fontWeight: 700,
            fontSize: "16px",
            borderRadius: "5px",
            boxShadow: "-5px 7px 32px -7px rgba(66, 68, 90, 1)",
          }}
        >
          Reset password
        </Button>
        <Text style={{ color: "#bbb", fontWeight: 400 }}>
          If you didn't request the password reset, ignore this email!
        </Text>
      </Container>
    </Html>
  );
}
