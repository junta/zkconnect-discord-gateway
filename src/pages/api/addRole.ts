// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  DataRequest,
  ZkConnect,
  ZkConnectServerConfig,
} from "@sismo-core/zk-connect-server";
import axios from "axios";

if (
  typeof process.env.NEXT_PUBLIC_SISMO_APP_ID !== "string" ||
  typeof process.env.DISCORD_TOKEN !== "string" ||
  typeof process.env.DISCORD_ROLE_ID !== "string" ||
  typeof process.env.DISCORD_GUILD_ID !== "string"
) {
  throw new Error("Please fill in your .env file");
}
const discordApiURL = "https://discord.com/api/v10";

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
  const { discordId, zkConnectResponse } = req.body;

  // res.status(200).json(zkConnectResponse);

  try {
    const { vaultId } = await zkConnect.verify(zkConnectResponse, {
      dataRequest: contributor,
    });
    console.log("vaultId", vaultId);
    const roleApiURL =
      discordApiURL +
      "/guilds/" +
      process.env.DISCORD_GUILD_ID +
      "/members/" +
      discordId +
      "/roles/" +
      process.env.DISCORD_ROLE_ID;
    const authValue = "Bot " + process.env.DISCORD_TOKEN;
    const response = await axios.put(
      roleApiURL,
      {},
      {
        headers: { Authorization: authValue },
      }
    );

    res.status(200).json({ discordId, status: "success", vaultId });
  } catch (e: any) {
    res.status(400).json({ status: "error", message: e.message });
  }
}
