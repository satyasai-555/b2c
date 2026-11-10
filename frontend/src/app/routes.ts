import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("cv-analysis", "routes/cv-analysis.tsx"), route("cv-analysis/questions", "routes/cv-questions.tsx")] satisfies RouteConfig;
