export type ConsoleDomain = 'crm'|'dispatch'|'inventory'|'accounting'|'reporting'|'security';
export type ConsoleMetric = { label:string; value:string|number; helper?:string; href?:string };
export type ConsoleModule = { domain:ConsoleDomain; title:string; description:string; href:string; status:'ready'|'building'|'attention'; metrics?:ConsoleMetric[] };
