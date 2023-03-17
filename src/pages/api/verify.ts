// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { zkConnectVerify } from "@/services";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { zkConnectResponse } = req.body;

  try {
    const vaultId = await zkConnectVerify(zkConnectResponse);
    console.log("vaultId", vaultId);

    res.status(200).json({ status: "not-added", vaultId });
  } catch (e: any) {
    res.status(400).json({ status: "error", message: e.message });
  }
}
