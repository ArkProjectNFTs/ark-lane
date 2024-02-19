import { Alchemy, Network } from "alchemy-sdk";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // network: Network.ETH_MAINNET,
  network: Network.ETH_GOERLI,
});

export type BridgeRequestEventStatus =
  | "deposit_initiated_l1"
  | "deposit_initiated_l2"
  | "error"
  | "withdraw_completed_l1"
  | "withdraw_completed_l2";

type BridgeRequestApiResponse = Array<{
  events: Array<{
    block_number: number;
    block_timestamp: number;
    label: BridgeRequestEventStatus;
    req_hash: string;
    tx_hash: string;
  }>;
  req: {
    chain_src: "eth" | "sn";
    collection_dst: string;
    collection_src: string;
    content: string;
    from: string;
    hash: string;
    to: string;
  };
  token_ids: [string, ...Array<string>];
}>;

type BridgeRequestResponse = {
  arrivalAddress: string;
  collectionImage: string | undefined;
  collectionName: string;
  collectionSourceAddress: string;
  status: BridgeRequestEventStatus;
  statusTimestamp: number;
  tokenIds: Array<string>;
  totalCount: number;
};

export const bridgeRequestRouter = createTRPCRouter({
  getBridgeRequestsFromAddress: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(
      async ({
        input,
      }): Promise<{
        inTransit: {
          requests: Array<BridgeRequestResponse>;
          totalCount: number;
        };
        past: { requests: Array<BridgeRequestResponse>; totalCount: number };
      }> => {
        const { address } = input;

        const bridgeRequestsResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_ARKLANE_API_DOMAIN ?? ""
          }/requests/${address}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (bridgeRequestsResponse.status !== 200) {
          return {
            inTransit: { requests: [], totalCount: 0 },
            past: { requests: [], totalCount: 0 },
          };
        }

        const bridgeRequests =
          (await bridgeRequestsResponse.json()) as BridgeRequestApiResponse;

        if (bridgeRequests.length === 0) {
          return {
            inTransit: { requests: [], totalCount: 0 },
            past: { requests: [], totalCount: 0 },
          };
        }
        // if (
        //   bridgeRequests[0] !== undefined &&
        //   bridgeRequests[0]?.req.chain_src === "eth"
        // ) {
        // }

        const requestMetadata = await alchemy.nft.getNftMetadataBatch(
          bridgeRequests.reverse().map((bridgeRequest) => ({
            contractAddress: bridgeRequest.req.collection_src,
            tokenId: bridgeRequest.token_ids[0],
          }))
        );

        const bridgeRequestsWithMetadata = bridgeRequests.map(
          (bridgeRequest, index) => {
            const lastBridgeRequestEvent =
              bridgeRequest.events[bridgeRequest.events.length - 1];

            return {
              arrivalAddress: bridgeRequest.req.to,
              collectionImage: requestMetadata[index]?.media[0]?.thumbnail,
              collectionName: requestMetadata[index]?.contract.name ?? "",
              collectionSourceAddress: bridgeRequest.req.collection_src,
              status: lastBridgeRequestEvent?.label ?? "error",
              statusTimestamp: lastBridgeRequestEvent?.block_timestamp ?? 0,
              tokenIds: bridgeRequest.token_ids,
              totalCount: bridgeRequest.token_ids.length,
            };
          }
        );

        const inTransitRequests: Array<BridgeRequestResponse> = [];
        const pastRequests: Array<BridgeRequestResponse> = [];

        bridgeRequestsWithMetadata.forEach((request) => {
          if (
            request.status === "deposit_initiated_l2" ||
            request.status === "deposit_initiated_l1"
          ) {
            inTransitRequests.push(request);
          } else {
            pastRequests.push(request);
          }
        });

        const inTransitTotalNfts = inTransitRequests.reduce(
          (acc, current) => acc + current.tokenIds.length,
          0
        );
        const pastTotalNfts = pastRequests.reduce(
          (acc, current) => acc + current.tokenIds.length,
          0
        );

        return {
          inTransit: {
            requests: inTransitRequests,
            totalCount: inTransitTotalNfts,
          },
          past: { requests: pastRequests, totalCount: pastTotalNfts },
        };
      }
    ),
  getHasBridgeRequestIndexed: publicProcedure
    .input(z.object({ transactionHash: z.string() }))
    .query(async ({ input }): Promise<boolean> => {
      const { transactionHash } = input;

      const bridgeRequestIndexedResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_ARKLANE_API_DOMAIN ?? ""
        }/tx/${transactionHash}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (bridgeRequestIndexedResponse.status !== 200) {
        return false;
      }

      return true;
    }),
});
