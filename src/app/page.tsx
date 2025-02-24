import ComingSoon from "@/components/coming-soon";

export default async function Pages() {
  return (
    <>
      <section
        id="features"
        className={"containerspace-y-12 py-8  md:py-12 lg:py-24"}
      >
        <div className="mx-auto text-white flex max-w-[58rem] flex-col items-center space-y-6 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            NFTs - New, Fairer Ticketing.
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Buy and sell NFT tickets using blinks and collectables on our
            transparent marketplace.
          </p>
        </div>
        <ComingSoon />
      </section>
    </>
  );
}
