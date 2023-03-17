import {
  DataRequest,
  ZkConnect,
  ZkConnectResponse,
  ZkConnectServerConfig,
} from "@sismo-core/zk-connect-server";

export const zkConnectVerify = async (zkConnectResponse: ZkConnectResponse) => {
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
  const { vaultId } = await zkConnect.verify(zkConnectResponse, {
    dataRequest: contributor,
  });
  return vaultId;
};
