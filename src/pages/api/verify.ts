// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  DataRequest,
  ZkConnect,
  ZkConnectServerConfig,
} from "@sismo-core/zk-connect-server";

if (
  typeof process.env.NEXT_PUBLIC_SISMO_APP_ID !== "string" ||
  typeof process.env.NEXT_PUBLIC_SISMO_GROUP_ID !== "string"
) {
  throw new Error("Please fill in your .env file");
}

const zkConnectConfig: ZkConnectServerConfig = {
  appId: process.env.NEXT_PUBLIC_SISMO_APP_ID,
  devMode: {
    enabled: true,
  },
};
const zkConnect = ZkConnect(zkConnectConfig);

const contributor = DataRequest({
  groupId: process.env.NEXT_PUBLIC_SISMO_GROUP_ID,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { zkConnectResponse } = req.body;

  try {
    const { vaultId } = await zkConnect.verify(zkConnectResponse, {
      dataRequest: contributor,
    });
    console.log("vaultId", vaultId);

    res.status(200).json({ status: "not-subscribed", vaultId });
  } catch (e: any) {
    res.status(400).json({ status: "error", message: e.message });
  }
}
