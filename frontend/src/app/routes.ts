import { type RouteConfig, index, route } from "@react-router/dev/routes";


export default [
    index("routes/home.tsx"),
    route("interview/setup", 'routes/interview-setup.tsx'),
    route("interview/ready", 'routes/interview-ready.tsx'),
    route("interview/session", 'routes/interview-session.tsx'),
    route("cv-analysis", "routes/cv-analysis.tsx"),
    route("cv-analysis/questions", "routes/cv-questions.tsx")
    ,route("refer", "routes/refer.tsx")
] satisfies RouteConfig;
