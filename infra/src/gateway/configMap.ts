import * as k8s from "@pulumi/kubernetes";

import config from "../config";
import { provider } from "../cluster/provider";

const krakendConfig = {
  version: 2,
  extra_config: {
    "github_com/devopsfaith/krakend-gologging": {
      level: "DEBUG",
      stdout: true,
    },
  },
  timeout: "5000ms",
  cache_ttl: "300s",
  output_encoding: "json",
  name: config.rendezvous.organizationId,
  endpoints: (config.rendezvous.services || []).map((service) => ({
    endpoint: service.id,
    method: "GET",
    extra_config: {
      "github.com/devopsfaith/krakend/proxy": {
        static: {
          strategy: "incomplete",
          data: {
            error: "Request could not be completed",
          },
        },
      },
    },
    output_encoding: "json",
    concurrent_calls: 1,
    backend: [
      {
        host: `http://rendezvous-${service.id}/`,
      },
    ],
  })),
};

export const configMap = new k8s.core.v1.ConfigMap(
  `krakend-config`,
  {
    data: {
      "krakend.json": JSON.stringify(krakendConfig),
    },
  },
  {
    provider,
  }
);
