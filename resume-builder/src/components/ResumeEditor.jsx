import { User, Briefcase, GraduationCap, Wrench, Plus, Trash2 } from 'lucide-react'

export default function ResumeEditor({ data, onChange }) {
  const updatePersonal = (field, value) => {
    onChange({
      ...data,
      personal: { ...data.personal, [field]: value }
    })
  }

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      company: '',
      position: '',
      duration: '',
      description: ''
    }
    onChange({
      ...data,
      experience: [...data.experience, newExp]
    })
  }

  const updateExperience = (id, field, value) => {
    onChange({
      ...data,
      experience: data.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    })
  }

  const removeExperience = (id) => {
    onChange({
      ...data,
      experience: data.experience.filter(exp => exp.id !== id)
    })
  }

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      school: '',
      degree: '',
      duration: ''
    }
    onChange({
      ...data,
      education: [...data.education, newEdu]
    })
  }

  const updateEducation = (id, field, value) => {
    onChange({
      ...data,
      education: data.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    })
  }

  const removeEducation = (id) => {
    onChange({
      ...data,
      education: data.education.filter(edu => edu.id !== id)
    })
  }

  const updateSkills = (value) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean)
    onChange({ ...data, skills })
  }

  return (
    <div className="space-y-6">
      {/* 个人信息 */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">个人信息</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              value={data.personal.name}
              onChange={(e) => updatePersonal('name', e.target.value)}
              className="input-field"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
            <input
              type="text"
              value={data.personal.title}
              onChange={(e) => updatePersonal('title', e.target.value)}
              className="input-field"
              placeholder="例如：前端工程师"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={data.personal.email}
              onChange={(e) => updatePersonal('email', e.target.value)}
              className="input-field"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
            <input
              type="tel"
              value={data.personal.phone}
              onChange={(e) => updatePersonal('phone', e.target.value)}
              className="input-field"
              placeholder="138-0000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所在地</label>
            <input
              type="text"
              value={data.personal.location}
              onChange={(e) => updatePersonal('location', e.target.value)}
              className="input-field"
              placeholder="例如：北京"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
            <textarea
              value={data.personal.summary}
              onChange={(e) => updatePersonal('summary', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="简要介绍自己..."
            />
          </div>
        </div>
      </section>

      {/* 工作经历 */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">工作经历</h2>
          </div>
          <button
            onClick={addExperience}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  className="input-field"
                  placeholder="公司名称"
                />
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  className="input-field"
                  placeholder="职位"
                />
                <input
                  type="text"
                  value={exp.duration}
                  onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                  className="input-field"
                  placeholder="时间段，如：2022.01 - 至今"
                />
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  className="input-field sm:col-span-2"
                  rows={2}
                  placeholder="工作描述"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 教育经历 */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">教育经历</h2>
          </div>
          <button
            onClick={addEducation}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                  className="input-field"
                  placeholder="学校名称"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  className="input-field"
                  placeholder="学位，如：计算机科学与技术 本科"
                />
                <input
                  type="text"
                  value={edu.duration}
                  onChange={(e) => updateEducation(edu.id, 'duration', e.target.value)}
                  className="input-field"
                  placeholder="时间段，如：2018.09 - 2022.06"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 技能 */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">技能</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            技能列表（用逗号分隔）
          </label>
          <textarea
            value={data.skills.join(', ')}
            onChange={(e) => updateSkills(e.target.value)}
            className="input-field"
            rows={3}
            placeholder="React, Vue, TypeScript, Node.js..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
