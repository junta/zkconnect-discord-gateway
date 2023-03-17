// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { zkConnectVerify, discordUserMemoryStore } from "@/services";

if (
  typeof process.env.DISCORD_TOKEN !== "string" ||
  typeof process.env.DISCORD_ROLE_ID !== "string" ||
  typeof process.env.DISCORD_GUILD_ID !== "string"
) {
  throw new Error("Please fill in your .env file");
}
const discordApiURL = "https://discord.com/api/v10";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { discordId, zkConnectResponse } = req.body;
  // res.status(200).json(zkConnectResponse);

  try {
    const vaultId = await zkConnectVerify(zkConnectResponse);
    // console.log("vaultId", vaultId);
    if (discordUserMemoryStore.has(vaultId)) {
      const existingUser = discordUserMemoryStore.get(vaultId);
      res.status(200).json({
        userId: existingUser,
        vaultId,
        status: "already-added",
      });
      return;
    }

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

    discordUserMemoryStore.set(vaultId, discordId);
    res.status(200).json({ discordId, status: "success", vaultId });
  } catch (e: any) {
    res.status(400).json({ status: "error", message: e.message });
  }
}
