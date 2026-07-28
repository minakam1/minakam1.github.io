import { useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, Smartphone, Monitor } from 'lucide-react'

export default function ResumePreview({ data }) {
  const resumeRef = useRef(null)

  const exportToPDF = async () => {
    if (!resumeRef.current) return
    
    const canvas = await html2canvas(resumeRef.current, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${data.personal.name || '简历'}.pdf`)
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex justify-between items-center no-print">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Monitor className="w-4 h-4 hidden sm:block" />
          <Smartphone className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">A4 尺寸预览</span>
          <span className="sm:hidden">手机预览</span>
        </div>
        <button
          onClick={exportToPDF}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出 PDF
        </button>
      </div>

      {/* 简历内容 */}
      <div className="overflow-auto bg-gray-200 p-4 sm:p-8 rounded-lg">
        <div
          ref={resumeRef}
          className="a4-paper mx-auto p-8 sm:p-12 text-sm"
          style={{ maxWidth: '210mm' }}
        >
          {/* 头部 */}
          <header className="border-b-2 border-gray-800 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.personal.name}
            </h1>
            <p className="text-lg text-gray-600 mb-3">{data.personal.title}</p>
            <div className="flex flex-wrap gap-4 text-gray-500 text-xs">
              {data.personal.email && (
                <span>{data.personal.email}</span>
              )}
              {data.personal.phone && (
                <span>{data.personal.phone}</span>
              )}
              {data.personal.location && (
                <span>{data.personal.location}</span>
              )}
            </div>
          </header>

          {/* 个人简介 */}
          {data.personal.summary && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                个人简介
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.personal.summary}
              </p>
            </section>
          )}

          {/* 工作经历 */}
          {data.experience.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                工作经历
              </h2>
              <div className="space-y-4">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {exp.position}
                      </h3>
                      <span className="text-gray-500 text-xs">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-1">{exp.company}</p>
                    {exp.description && (
                      <p className="text-gray-700 text-xs leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 教育经历 */}
          {data.education.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                教育经历
              </h2>
              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <h3 className="font-semibold text-gray-900">
                        {edu.school}
                      </h3>
                      <span className="text-gray-500 text-xs">
                        {edu.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{edu.degree}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 技能 */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                技能
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
