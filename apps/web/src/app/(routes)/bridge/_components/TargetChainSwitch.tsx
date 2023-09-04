import { Typography } from "design-system";
import Image from "next/image";

import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { useIsSSR } from "~/app/_hooks/useIsSSR";

import { CHAIN_LOGOS_BY_NAME } from "../../../_lib/utils/connectors";
import TargetChainButton from "./TargetChainButton";

export default function TargetChainSwitch() {
  const { setTargetChain, targetChain } = useCurrentChain();
  const isSSR = useIsSSR();

  return (
    <div className=" my-8 inline-flex gap-0.5">
      <button
        className={`flex items-center gap-2 rounded-l-2xl py-4 pl-3 pr-8 ${
          !isSSR && targetChain === "Ethereum"
            ? "bg-primary-100 dark:bg-primary-400"
            : "bg-neutral-200 dark:bg-dark-blue-950"
        }`}
        onClick={() => setTargetChain("Ethereum")}
      >
        <Image
          alt={`Ethereum logo`}
          height={32}
          src={CHAIN_LOGOS_BY_NAME.Ethereum}
          width={32}
        />
        <Typography variant="button_text_s">Ethereum</Typography>
      </button>
      <TargetChainButton orientation="horizontal" />
      <button
        className={`flex items-center gap-2 rounded-r-2xl py-4 pl-8 pr-3 ${
          !isSSR && targetChain === "Starknet"
            ? "bg-primary-100 dark:bg-primary-400"
            : "bg-neutral-200 dark:bg-dark-blue-950"
        }`}
        onClick={() => setTargetChain("Starknet")}
      >
        <Typography variant="button_text_s">Starknet</Typography>
        <Image
          alt={`Starknet logo`}
          height={32}
          src={CHAIN_LOGOS_BY_NAME.Starknet}
          width={32}
        />
      </button>
    </div>
  );
}