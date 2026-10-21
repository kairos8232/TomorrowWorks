// Screen language: English, Bahasa Malaysia, Chinese (simplified).
// Keys are the English text, so a missing translation falls back to English.
// Translations were drafted with Claude and must be reviewed by the team.
// ESCO skill labels and role titles stay in English: ESCO has no Malay or
// Chinese version, and inventing one would change the official vocabulary.
import { createContext, useContext } from 'react';

export type Lang = 'en' | 'ms' | 'zh';
export const languages: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'ms', label: 'Bahasa Malaysia' },
  { id: 'zh', label: '中文' },
];

type Entry = { ms: string; zh: string };
const dict: Record<string, Entry> = {
  // Navigation and shell
  'Your career, mapped forward.': { ms: 'Kerjaya anda, dipetakan ke hadapan.', zh: '规划你的未来职业。' },
  'My career': { ms: 'Kerjaya saya', zh: '我的职业' },
  'For teams': { ms: 'Untuk pasukan', zh: '团队' },
  'The job market': { ms: 'Pasaran kerja', zh: '就业市场' },
  '1. Your skills': { ms: '1. Kemahiran anda', zh: '1. 你的技能' },
  '2. Your moves': { ms: '2. Langkah anda', zh: '2. 你的职业选择' },
  '3. Your plan': { ms: '3. Pelan anda', zh: '3. 你的学习计划' },
  'Describe your work': { ms: 'Terangkan kerja anda', zh: '描述你的工作' },
  'Roles ranked for you': { ms: 'Peranan disusun untuk anda', zh: '为你排名的职位' },
  'What to learn next': { ms: 'Apa perlu dipelajari', zh: '下一步学什么' },
  'Team view': { ms: 'Paparan pasukan', zh: '团队视图' },
  'For HR and career centres': { ms: 'Untuk HR dan pusat kerjaya', zh: '供人力资源和就业中心使用' },
  'Job ads': { ms: 'Iklan kerja', zh: '招聘广告' },
  'Demand by occupation': { ms: 'Permintaan mengikut pekerjaan', zh: '各职业需求' },
  'AI exposure': { ms: 'Pendedahan AI', zh: 'AI 影响程度' },
  'How much AI could change': { ms: 'Sejauh mana AI boleh mengubah', zh: 'AI 可能改变多少' },
  'Workplace news': { ms: 'Berita tempat kerja', zh: '职场新闻' },
  'Latest reported changes': { ms: 'Perubahan terkini dilaporkan', zh: '最新报道的变化' },
  'Skills in demand': { ms: 'Kemahiran diperlukan', zh: '热门技能' },
  'Skills employers ask for': { ms: 'Kemahiran dicari majikan', zh: '雇主要求的技能' },
  Soon: { ms: 'Akan datang', zh: '即将推出' },
  'Prototype for SDC Hackathon 2026': { ms: 'Prototaip untuk SDC Hackathon 2026', zh: 'SDC Hackathon 2026 原型' },
  'Profiles are fictional or stay in your browser.': { ms: 'Profil adalah rekaan atau kekal dalam pelayar anda.', zh: '个人资料为虚构，或只保存在你的浏览器中。' },
  Language: { ms: 'Bahasa', zh: '语言' },
  'Coming soon': { ms: 'Akan datang', zh: '即将推出' },

  // Page titles and intros
  'Your skills': { ms: 'Kemahiran anda', zh: '你的技能' },
  'Tell us what you do. Your moves are ranked from these skills only.': { ms: 'Beritahu kami apa yang anda lakukan. Langkah anda disusun daripada kemahiran ini sahaja.', zh: '告诉我们你做什么。职业选择只根据这些技能排名。' },
  'Your moves': { ms: 'Langkah anda', zh: '你的职业选择' },
  'Nine roles ranked by how well your skills fit, whether job ads are rising, and how much of the work AI could change.': { ms: 'Sembilan peranan disusun mengikut kesesuaian kemahiran anda, sama ada iklan kerja meningkat, dan sejauh mana AI boleh mengubah kerja itu.', zh: '九个职位，按技能匹配度、招聘广告是否增加、以及 AI 可能改变多少工作内容排名。' },
  'Your plan': { ms: 'Pelan anda', zh: '你的学习计划' },
  'Courses for the skills a move needs, in a sensible order, and the Malaysian certification route where one exists.': { ms: 'Kursus untuk kemahiran yang diperlukan, mengikut urutan yang munasabah, dan laluan pensijilan Malaysia jika ada.', zh: '按合理顺序列出所需技能的课程，以及适用的马来西亚认证途径。' },
  'For HR and learning managers planning how to reskill a team, and career centres advising a class.': { ms: 'Untuk pengurus HR dan latihan yang merancang latihan semula pasukan, dan pusat kerjaya yang menasihati pelajar.', zh: '供规划团队再培训的人力资源与培训经理，以及为学生提供建议的就业中心使用。' },
  'Job ads in Malaysia': { ms: 'Iklan kerja di Malaysia', zh: '马来西亚招聘广告' },
  'Online job ads by occupation group, Q1 to Q2 2026.': { ms: 'Iklan kerja dalam talian mengikut kumpulan pekerjaan, S1 hingga S2 2026.', zh: '按职业类别统计的网上招聘广告，2026 年第一至第二季度。' },
  'AI exposure by role': { ms: 'Pendedahan AI mengikut peranan', zh: '各职位的 AI 影响程度' },
  'How much of each role’s work generative AI could change.': { ms: 'Sejauh mana AI generatif boleh mengubah kerja setiap peranan.', zh: '生成式 AI 可能改变每个职位多少工作。' },
  'What Malaysian outlets reported recently about AI, layoffs, hiring and reskilling.': { ms: 'Apa yang dilaporkan media Malaysia baru-baru ini tentang AI, pemberhentian, pengambilan dan latihan semula.', zh: '马来西亚媒体近期关于 AI、裁员、招聘和再培训的报道。' },
  'Skills that Malaysian employers ask for.': { ms: 'Kemahiran yang dicari majikan Malaysia.', zh: '马来西亚雇主要求的技能。' },

  // Home
  'AI is changing your job. See where you can move next.': { ms: 'AI sedang mengubah kerja anda. Lihat ke mana anda boleh melangkah.', zh: 'AI 正在改变你的工作。看看你下一步可以去哪里。' },
  'For Malaysian workers, graduates, and the people who advise them. TomorrowWorks compares skills with nine real roles, using official Malaysian job-ad figures and international research on AI.': { ms: 'Untuk pekerja dan graduan Malaysia, serta mereka yang menasihati mereka. TomorrowWorks membandingkan kemahiran dengan sembilan peranan sebenar, menggunakan data rasmi iklan kerja Malaysia dan kajian antarabangsa tentang AI.', zh: '面向马来西亚的在职人士、毕业生和他们的顾问。TomorrowWorks 使用马来西亚官方招聘数据和国际 AI 研究，把技能与九个真实职位进行比较。' },
  'Start with my own skills': { ms: 'Mula dengan kemahiran saya', zh: '从我自己的技能开始' },
  'Try a sample person': { ms: 'Cuba contoh orang', zh: '试用示例人物' },
  'No account, no CV. Nothing you enter leaves your browser tab except the words you send to the skill search.': { ms: 'Tiada akaun, tiada CV. Tiada apa yang anda masukkan keluar dari tab pelayar kecuali perkataan yang dihantar ke carian kemahiran.', zh: '无需账户，无需简历。除了发送给技能搜索的文字，你输入的内容不会离开浏览器。' },
  'How it works': { ms: 'Cara ia berfungsi', zh: '如何运作' },
  'Your skills.': { ms: 'Kemahiran anda.', zh: '你的技能。' },
  'Describe your work in your own words. An AI model finds the matching skills, and you confirm them.': { ms: 'Terangkan kerja anda dengan perkataan sendiri. Model AI mencari kemahiran yang sepadan, dan anda mengesahkannya.', zh: '用自己的话描述工作。AI 模型找出匹配的技能，由你确认。' },
  'Your moves.': { ms: 'Langkah anda.', zh: '你的职业选择。' },
  'Nine roles ranked by skill fit, job-ad demand and AI exposure. Every score shows its reasons.': { ms: 'Sembilan peranan disusun mengikut kesesuaian kemahiran, permintaan iklan kerja dan pendedahan AI. Setiap skor menunjukkan sebabnya.', zh: '九个职位按技能匹配、招聘需求和 AI 影响排名。每个分数都显示原因。' },
  'Your plan.': { ms: 'Pelan anda.', zh: '你的学习计划。' },
  'Pick a move and get courses for the skills it needs, free first, plus the Malaysian SKM route where one exists.': { ms: 'Pilih satu langkah dan dapatkan kursus untuk kemahiran yang diperlukan, percuma dahulu, serta laluan SKM Malaysia jika ada.', zh: '选择一个职位，获取所需技能的课程（免费优先），以及适用的马来西亚 SKM 认证途径。' },
  'Try it as someone else': { ms: 'Cuba sebagai orang lain', zh: '以他人身份试用' },
  'Top moves with Q2 2026 data': { ms: 'Langkah teratas dengan data S2 2026', zh: '根据 2026 年第二季度数据的首选职位' },
  'See {name}’s moves': { ms: 'Lihat langkah {name}', zh: '查看 {name} 的职业选择' },
  'HR managers and career centres': { ms: 'Pengurus HR dan pusat kerjaya', zh: '人力资源经理和就业中心' },
  'A whole team or class': { ms: 'Seluruh pasukan atau kelas', zh: '整个团队或班级' },
  'See which roles fit each person, and which skills the group lacks most for a move, with a course for each.': { ms: 'Lihat peranan yang sesuai untuk setiap orang, dan kemahiran yang paling kurang dalam kumpulan, dengan kursus untuk setiap satu.', zh: '查看每个人适合哪些职位，以及团队最缺哪些技能，并为每项技能提供课程。' },
  'Open the Team view': { ms: 'Buka paparan pasukan', zh: '打开团队视图' },
  'Where the numbers come from': { ms: 'Dari mana angka ini datang', zh: '数据来源' },
  'Department of Statistics Malaysia. Online job ads by occupation, every quarter.': { ms: 'Jabatan Perangkaan Malaysia. Iklan kerja dalam talian mengikut pekerjaan, setiap suku tahun.', zh: '马来西亚统计局。每季度按职业统计的网上招聘广告。' },
  'International Labour Organization. How much of each job’s tasks generative AI could change.': { ms: 'Pertubuhan Buruh Antarabangsa. Sejauh mana AI generatif boleh mengubah tugas setiap pekerjaan.', zh: '国际劳工组织。生成式 AI 可能改变每种工作的多少任务。' },
  'The European Commission’s list of skills and occupations. It uses the same job codes as Malaysia’s MASCO.': { ms: 'Senarai kemahiran dan pekerjaan Suruhanjaya Eropah. Ia menggunakan kod pekerjaan yang sama dengan MASCO Malaysia.', zh: '欧盟委员会的技能与职业清单，使用与马来西亚 MASCO 相同的职业代码。' },
  'Working adult whose job AI is changing': { ms: 'Pekerja yang kerjanya sedang diubah oleh AI', zh: '工作正被 AI 改变的在职人士' },
  'Fresh graduate choosing a first job': { ms: 'Graduan baharu memilih kerja pertama', zh: '选择第一份工作的应届毕业生' },

  // Skills step
  'Your current job': { ms: 'Kerja semasa anda', zh: '你目前的工作' },
  'Shown as “Now” so you can compare. It is never recommended back to you.': { ms: 'Ditunjukkan sebagai “Kini” untuk perbandingan. Ia tidak akan dicadangkan semula kepada anda.', zh: '显示为“现在”以便比较，不会再推荐给你。' },
  'Not in this list': { ms: 'Tiada dalam senarai', zh: '不在此列表中' },
  'In English, Bahasa Malaysia or Chinese. An AI model finds the closest skills in ESCO, the European Commission’s list of 13,960 skills. It only finds existing skills; you decide which are true.': { ms: 'Dalam Bahasa Inggeris, Bahasa Malaysia atau Cina. Model AI mencari kemahiran paling hampir dalam ESCO, senarai 13,960 kemahiran Suruhanjaya Eropah. Ia hanya mencari kemahiran sedia ada; anda tentukan yang benar.', zh: '可用英文、马来文或中文。AI 模型在欧盟委员会 ESCO 的 13,960 项技能中找出最接近的技能。它只查找已有技能，由你决定哪些属实。' },
  'Find my skills': { ms: 'Cari kemahiran saya', zh: '查找我的技能' },
  'Searching…': { ms: 'Mencari…', zh: '搜索中…' },
  'Or search the skill list': { ms: 'Atau cari dalam senarai kemahiran', zh: '或搜索技能列表' },
  'No skills yet. Describe your work or search the list above.': { ms: 'Belum ada kemahiran. Terangkan kerja anda atau cari dalam senarai di atas.', zh: '还没有技能。请描述你的工作或搜索上面的列表。' },
  'See my moves': { ms: 'Lihat langkah saya', zh: '查看我的职业选择' },
  'Add at least one skill first.': { ms: 'Tambah sekurang-kurangnya satu kemahiran dahulu.', zh: '请先添加至少一项技能。' },

  // Moves step
  'Use my own skills': { ms: 'Guna kemahiran saya', zh: '使用我自己的技能' },
  'Edit skills': { ms: 'Sunting kemahiran', zh: '编辑技能' },
  'How to read this': { ms: 'Cara membaca ini', zh: '如何阅读' },
  'Is this fair?': { ms: 'Adakah ini adil?', zh: '这样公平吗？' },
  'Job-ad data': { ms: 'Data iklan kerja', zh: '招聘数据' },
  'If AI changes work': { ms: 'Jika AI mengubah kerja', zh: '如果 AI 改变工作' },
  Gradually: { ms: 'Secara beransur', zh: '逐渐地' },
  Quickly: { ms: 'Dengan cepat', zh: '迅速地' },
  Rank: { ms: 'Kedudukan', zh: '排名' },
  Role: { ms: 'Peranan', zh: '职位' },
  'Skill fit': { ms: 'Kesesuaian kemahiran', zh: '技能匹配' },
  Demand: { ms: 'Permintaan', zh: '需求' },
  'AI resilience': { ms: 'Ketahanan AI', zh: 'AI 抗性' },
  Score: { ms: 'Skor', zh: '分数' },
  Now: { ms: 'Kini', zh: '现在' },
  'Plan this move': { ms: 'Rancang langkah ini', zh: '规划这个职位' },
  'You have': { ms: 'Anda ada', zh: '你已具备' },
  'To build': { ms: 'Perlu dibina', zh: '需要培养' },
  'Select a role to see the skills you have and the skills to build, then plan the move.': { ms: 'Pilih satu peranan untuk melihat kemahiran yang ada dan yang perlu dibina, kemudian rancang langkah itu.', zh: '选择一个职位，查看已有和需要培养的技能，然后制定计划。' },
  'What changed with {q} job-ad data': { ms: 'Apa yang berubah dengan data iklan kerja {q}', zh: '{q} 招聘数据带来的变化' },
  'Show all {n}': { ms: 'Tunjuk semua {n}', zh: '显示全部 {n} 项' },
  'Show fewer': { ms: 'Tunjuk kurang', zh: '收起' },

  // Plan step
  'Back to your moves': { ms: 'Kembali ke langkah anda', zh: '返回职业选择' },
  'Malaysian certification route': { ms: 'Laluan pensijilan Malaysia', zh: '马来西亚认证途径' },
  'No checked course yet': { ms: 'Belum ada kursus yang disemak', zh: '尚无已核实课程' },
  'How this plan is made': { ms: 'Bagaimana pelan ini dibuat', zh: '计划如何制定' },
  Builds: { ms: 'Membina', zh: '培养' },

  // Team view
  Group: { ms: 'Kumpulan', zh: '群组' },
  'Who fits which role': { ms: 'Siapa sesuai untuk peranan mana', zh: '谁适合哪个职位' },
  Person: { ms: 'Orang', zh: '人员' },
  Average: { ms: 'Purata', zh: '平均' },
  'Shared gaps for {role}': { ms: 'Jurang bersama untuk {role}', zh: '{role} 的共同技能缺口' },
};

const LangContext = createContext<Lang>('en');
export const LangProvider = LangContext.Provider;

/** t('Text with {name}', { name }) in the current language; English if no translation. */
export function useT() {
  return translate(useContext(LangContext));
}

export function translate(lang: Lang) {
  return (en: string, vars: Record<string, string | number> = {}) => {
    const text = lang === 'en' ? en : dict[en]?.[lang] ?? en;
    return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
  };
}

export const translationKeys = Object.keys(dict);
