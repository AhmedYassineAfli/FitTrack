import { useState } from "react"
import { Plus, MoreHorizontal } from "lucide-react"
import {
  Card,
  SectionTitle,
  Tag,
  Button,
  Select,
  LineChart,
} from "../../components/common"
import { measurementHistory } from "../../data/mockData"

export function MeasurementsPage() {
  const [timeRange, setTimeRange] = useState("6 months")

  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Body measurements</h1>
          <p>Track changes and understand your body composition.</p>
        </div>
        <Button icon={<Plus size={17} />}>Add measurement</Button>
      </div>

      <div className="summary-grid">
        <Card className="summary-stat">
          <span>Current BMI</span>
          <b>22.9</b>
          <Tag>OPTIMAL RANGE</Tag>
        </Card>
        <Card className="summary-stat">
          <span>Body fat</span>
          <b>15.8%</b>
          <small>-0.6% this month</small>
        </Card>
        <Card className="summary-stat">
          <span>Current weight</span>
          <b>
            74.2 <em>kg</em>
          </b>
          <small>-1.8 kg this month</small>
        </Card>
      </div>

      <Card>
        <SectionTitle
          title="Weight evolution"
          detail="January — June 2025"
          action={
            <Select
              label=""
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option>6 months</option>
              <option>1 year</option>
            </Select>
          }
        />
        <LineChart />
      </Card>

      <Card>
        <SectionTitle title="Measurement history" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Body fat</th>
                <th>Waist</th>
                <th>Chest</th>
                <th>Arms</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {measurementHistory.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.weight}</td>
                  <td>{record.bodyFat}</td>
                  <td>{record.waist}</td>
                  <td>{record.chest}</td>
                  <td>{record.arms}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Actions"
                      style={{ width: "28px", height: "28px" }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
