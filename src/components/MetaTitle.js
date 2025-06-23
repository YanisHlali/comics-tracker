import Head from "next/head";

export default function MetaTitle({ title }) {
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}
