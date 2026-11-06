import {
  FaYoutube as Youtube,
  FaInstagram as Instagram,
  FaLinkedin as Linkedin,
} from "react-icons/fa";
import { Logo } from './UI';
import type { Action } from './Header';
export default function Footer({onAction}:{onAction:Action}){
  const groups = [{name:'PRODUCT',links:['AI CV Analysis','CV Enhancer','Mock Interviews','Skill Gap Analysis','Job Opportunities']},{name:'COMPANY',links:['About Us','Careers','Blog','Contact Us','Privacy Policy','Terms']},{name:'RESOURCES',links:['Interview Tips','CV Writing Tips','Learning Resources','Help Center','FAQ']}];
  return <footer id="contact"><div className="wrap"><div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr]"><div><Logo/><p className="mt-6 text-sm font-semibold">Practice. Improve. Get Hired.</p><p className="mt-4 max-w-sm text-sm leading-7 text-muted">AI powered career preparation platform for job seekers.</p><div className="mt-7 flex gap-3">{[{name:'X',icon:null},{name:'YouTube',icon:Youtube},{name:'Instagram',icon:Instagram},{name:'LinkedIn',icon:Linkedin}].map(({name,icon:Icon})=><button key={name} onClick={()=>onAction(name)} aria-label={name} className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-500 hover:text-brand">{Icon?<Icon size={18}/>:<span>𝕏</span>}</button>)}</div></div>{groups.map(group=><div key={group.name}><h2 className="mb-5 text-xs font-bold tracking-wider text-muted">{group.name}</h2><ul className="space-y-3">{group.links.map(link=><li key={link}>{link==='FAQ'?<a className="text-sm text-slate-600 hover:text-brand" href="#faq">{link}</a>:<button className="text-left text-sm text-slate-600 hover:text-brand" onClick={()=>onAction(link)}>{link}</button>}</li>)}</ul></div>)}</div><div className="flex flex-col justify-between gap-4 border-t border-line py-7 text-xs text-muted sm:flex-row"><p>© {new Date().getFullYear()} WelHire. All rights reserved.</p><div className="flex gap-4"><button onClick={()=>onAction('Privacy Policy')}>Privacy Policy</button><span aria-hidden="true">|</span><button onClick={()=>onAction('Terms & Conditions')}>Terms & Conditions</button></div></div></div></footer>;
}
