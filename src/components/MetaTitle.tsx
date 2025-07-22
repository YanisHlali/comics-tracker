import Head from "next/head";

interface MetaTitleProps {
  title?: string;
}

export default function MetaTitle({ title }: MetaTitleProps) {
  const defaultTitle = "Comics Tracker";
  const safeTitle = title && typeof title === "string" && title.trim() ? title : defaultTitle;

  return (
    <Head>
      <title>{safeTitle}</title>
      <meta name="title" content={safeTitle} />
      <meta property="og:title" content={safeTitle} />
    </Head>
  );
}