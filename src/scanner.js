const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const yaml = require("js-yaml");

function scanProject(projectPath = process.cwd()) {
  const discovered = {
    services: [],
    envVariables: {},
  };

  const envPath = path.join(projectPath, ".env");
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    discovered.envVariables = envConfig;

    for (const [key, value] of Object.entries(envConfig)) {
      if (key.includes("REDIS"))
        discovered.services.push({
          name: "Redis",
          type: "redis",
          target: value,
          source: ".env",
        });
      else if (key.includes("MONGO"))
        discovered.services.push({
          name: "MongoDB",
          type: "mongodb",
          target: value,
          source: ".env",
        });
      else if (key.includes("POSTGRES") || key === "DB_URL")
        discovered.services.push({
          name: "PostgreSQL",
          type: "postgres",
          target: value,
          source: ".env",
        });
      else if (key.match(/_(URL|URI|PORT|HOST)$/i)) {
        const cleanName = key
          .replace(/_(URL|URI|PORT|HOST)$/i, "")
          .replace(/_/g, " ");
        discovered.services.push({
          name: cleanName,
          type: "env-service",
          target: value,
          source: ".env",
        });
      }
    }
  }

  const pkgPath = path.join(projectPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps["redis"] || deps["ioredis"])
      discovered.services.push({
        name: "Redis",
        type: "redis",
        source: "package.json",
      });
    if (deps["mongoose"] || deps["mongodb"])
      discovered.services.push({
        name: "MongoDB",
        type: "mongodb",
        source: "package.json",
      });
    if (deps["pg"])
      discovered.services.push({
        name: "PostgreSQL",
        type: "postgres",
        source: "package.json",
      });
  }

  const pomPath = path.join(projectPath, "pom.xml");
  if (fs.existsSync(pomPath)) {
    const pomContent = fs.readFileSync(pomPath, "utf8");
    if (pomContent.includes("spring-boot-starter-data-redis"))
      discovered.services.push({
        name: "Redis",
        type: "redis",
        source: "pom.xml",
      });
    if (pomContent.includes("postgresql"))
      discovered.services.push({
        name: "PostgreSQL",
        type: "postgres",
        source: "pom.xml",
      });
  }

  const dockerPath = path.join(projectPath, "docker-compose.yml");
  if (fs.existsSync(dockerPath)) {
    discovered.services.push({
      name: "Docker Engine",
      type: "infrastructure",
      source: "docker-compose.yml",
    });

    try {
      const fileContents = fs.readFileSync(dockerPath, "utf8");
      const data = yaml.load(fileContents);

      if (data && data.services) {
        Object.keys(data.services).forEach((serviceName) => {
          discovered.services.push({
            name: serviceName.toUpperCase(),
            type: "docker-service",
            source: "docker-compose.yml",
          });
        });
      }
    } catch (e) {
    }
  }

  // 5. KUBERNETES TARAMASI
  const k8sPaths = ["k8s", "kubernetes", "k8s.yaml", "deployment.yaml"];
  for (const kPath of k8sPaths) {
    if (fs.existsSync(path.join(projectPath, kPath))) {
      discovered.services.push({
        name: "Kubernetes Configs",
        type: "infrastructure",
        source: kPath,
      });
      break;
    }
  }

  const uniqueServices = [];
  const seenNames = new Set();
  for (const service of discovered.services) {
    if (!seenNames.has(service.name)) {
      seenNames.add(service.name);
      uniqueServices.push(service);
    }
  }
  discovered.services = uniqueServices;

  return discovered;
}

module.exports = { scanProject };
