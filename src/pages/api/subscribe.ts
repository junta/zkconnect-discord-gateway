// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  DataRequest,
  ZkConnect,
  ZkConnectServerConfig,
} from "@sismo-core/zk-connect-server";

const emailMemoryStore = new Map();

const zkConnectConfig: ZkConnectServerConfig = {
  appId: "0x112a692a2005259c25f6094161007967",
};
const zkConnect = ZkConnect(zkConnectConfig);

const THE_MERGE_CONTRIBUTOR = DataRequest({
  groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a",
});

type Data = {
  email: string;
};

export default async function handler(
  req: NextApiRequest,
  // res: NextApiResponse<Data>
  res: NextApiResponse
) {
  const { email, zkConnectResponse } = req.body;

  try {
    const { vaultId } = await zkConnect.verify(zkConnectResponse, {
      dataRequest: THE_MERGE_CONTRIBUTOR,
    });
    console.log("vaultId", vaultId);
    // if email is not provided, check if the user is already subscribed
    if (!email) {
      if (emailMemoryStore.has(vaultId)) {
        const existingEmail = emailMemoryStore.get(vaultId);
        res.status(200).json({
          email: existingEmail,
          vaultId,
          status: "already-subscribed",
        });
        return;
      }
      res.status(200).json({ status: "not-subscribed", vaultId });
    } else {
      emailMemoryStore.set(vaultId, email);
      res.status(200).json({ email, status: "success", vaultId });
    }
  } catch (e: any) {
    res.status(400).json({ status: "error", message: e.message });
  }
}