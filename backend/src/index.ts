import express from "express";
import cors from "cors";
import { DataRequest, ZkConnect, ZkConnectServerConfig } from "@sismo-core/zk-connect-server";

const emailMemoryStore = new Map();

const zkConnectConfig: ZkConnectServerConfig = {
  appId: "0x112a692a2005259c25f6094161007967",
}
const zkConnect = ZkConnect(zkConnectConfig);

const THE_MERGE_CONTRIBUTOR = DataRequest({
  groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a",
});

const app = express();
app.use(cors());
app.use(express.json());

app.post("/subscribe", async (req, res) => {
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
        res.status(200).send({
          email: existingEmail,
          vaultId,
          status: "already-subscribed",
        });
        return;
      }
      res.status(200).send({ status: "not-subscribed", vaultId });
    } else {
      emailMemoryStore.set(vaultId, email);
      res.status(200).send({ email, status: "success", vaultId });
    }
  } catch (e: any) {
    res.status(400).send({ status: "error", message: e.message });
  }
});

app.post("/reset", async (req, res) => {
  emailMemoryStore.clear();
  res.status(200).send({ status: "success" });
});

app.listen(process.env.PORT ?? 8080);
