import { Button, Modal, Typography } from "design-system";
import Image from "next/image";

import { CHAIN_LOGOS_BY_NAME } from "~/app/helpers";
import useCurrentChain from "~/hooks/useCurrentChain";

interface NftTransferModalProps {
  image: string;
  isOpen: boolean;
  name: string;
  onOpenChange: (open: boolean) => void;
}

export default function NftTransferModal({
  image,
  isOpen,
  name,
  onOpenChange,
}: NftTransferModalProps) {
  const { sourceChain, targetChain } = useCurrentChain();
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="mt-5 flex flex-col gap-5">
        <div className="flex gap-4">
          <Image
            alt="nft image"
            className="h-28 w-28 rounded-lg"
            height={112}
            src={image}
            width={112}
          />
          <div>
            <Typography component="h3" variant="heading_light_xs">
              {name}
              <br />
              Migration in Progress
            </Typography>
            <Typography variant="body_text_14">
              Your asset cross the bridge, the small walk will take 15 minutes
            </Typography>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md bg-[#F7FBFA] px-4 py-3 dark:bg-dark-blue-900">
          {/* <div className="flex items-center justify-between rounded-md bg-[#F7FBFA] px-4 py-3 dark:bg-[#0e2230]"> */}
          <Image
            alt={`${CHAIN_LOGOS_BY_NAME[sourceChain]} logo`}
            height={52}
            src={CHAIN_LOGOS_BY_NAME[sourceChain]}
            width={52}
          />

          <Typography
            className="text-center"
            component="p"
            variant="button_text_s"
          >
            🌈 <br />
            Assets en route to {targetChain}
          </Typography>

          <Image
            alt={`${CHAIN_LOGOS_BY_NAME[targetChain]} logo`}
            height={52}
            src={CHAIN_LOGOS_BY_NAME[targetChain]}
            width={52}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Typography variant="body_text_14">Transaction sent</Typography>
            <Typography variant="body_text_14">1/1</Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body_text_14">
              Transaction confirmed
            </Typography>
            <Typography variant="body_text_14">1/1</Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body_text_14">
              Nfts received on {targetChain}
            </Typography>
            <Typography variant="body_text_14">1/1</Typography>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md bg-[#F0E9FFE0] p-3">
          <Typography component="p" variant="body_text_14">
            Note that it will not cancel the gas fee.
          </Typography>
          <Button variant="s">Stop transfer</Button>
        </div>
      </div>
    </Modal>
  );
}