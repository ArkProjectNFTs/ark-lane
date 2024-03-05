import { Typography } from "design-system";

import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useIsFullyConnected from "~/app/_hooks/useIsFullyConnected";

interface CollectionHeaderProps {
  collectionTotalCount?: number;
}
export default function CollectionHeader({
  collectionTotalCount,
}: CollectionHeaderProps) {
  const { sourceChain, targetChain } = useCurrentChain();
  const isFullyConnected = useIsFullyConnected();

  return (
    <div className="mb-10 text-left">
      <div className="flex max-w-full items-center gap-3.5">
        <Typography ellipsable variant="heading_light_s">
          Collections on {sourceChain}
        </Typography>
        {collectionTotalCount !== undefined && (
          <Typography
            className="rounded-full bg-primary-source px-2.5 py-1 text-white dark:text-galaxy-blue"
            variant="button_text_s"
          >
            {collectionTotalCount}
          </Typography>
        )}
      </div>
      <Typography className="mt-4" component="p" variant="body_text_20">
        {collectionTotalCount === undefined && isFullyConnected
          ? "Loading collections in progress..."
          : collectionTotalCount === 0 || !isFullyConnected
          ? `It looks like you have no nfts collection on ${sourceChain}...`
          : `Select the assets you want to transfer to ${targetChain}`}
      </Typography>
    </div>
  );
}
