import dns from "dns";

/**
 * Local environments may need public resolvers to resolve MongoDB Atlas SRV
 * records. Production hosts use their own DNS by default; DNS_SERVERS can
 * override that when a deployment platform requires custom resolvers.
 */
const configureDns = (): void => {
  const configuredServers = process.env.DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  const servers = configuredServers?.length
    ? configuredServers
    : process.env.NODE_ENV === "production"
      ? []
      : ["8.8.8.8", "1.1.1.1"];

  if (servers.length) dns.setServers(servers);
};

export default configureDns;
