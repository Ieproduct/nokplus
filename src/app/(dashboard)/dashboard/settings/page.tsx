import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  getTaxRulesConfig,
  getDocumentSettingsConfig,
  getVendorRequirementsConfig,
} from "@/lib/config/loader";
import { getActiveCompany, getCompanyMembers } from "@/lib/actions/company";
import { getAllDepartments, getAllCostCenters } from "@/lib/actions/department";
import { getApprovalFlows } from "@/lib/actions/flow";
import { CompanyForm } from "@/components/settings/company-form";
import { DepartmentManager } from "@/components/settings/department-manager";
import { CostCenterManager } from "@/components/settings/cost-center-manager";
import { MemberManager } from "@/components/settings/member-manager";
import { ApprovalFlowList } from "@/components/settings/approval-flow-list";

export default async function SettingsPage() {
  const [company, departments, costCenters, members, flows] = await Promise.all([
    getActiveCompany(),
    getAllDepartments(),
    getAllCostCenters(),
    getCompanyMembers(),
    getApprovalFlows(),
  ]);

  const tax = getTaxRulesConfig();
  const docSettings = getDocumentSettingsConfig();
  const vendorReqs = getVendorRequirementsConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground">
          จัดการข้อมูลบริษัท แผนก สมาชิก และระบบอนุมัติ
        </p>
      </div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">ข้อมูลบริษัท</TabsTrigger>
          <TabsTrigger value="departments">แผนก</TabsTrigger>
          <TabsTrigger value="cost-centers">Cost Center</TabsTrigger>
          <TabsTrigger value="members">สมาชิก</TabsTrigger>
          <TabsTrigger value="approvals">ระบบอนุมัติ</TabsTrigger>
          <TabsTrigger value="system">ภาษี/เอกสาร</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <CompanyForm company={company} />
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <DepartmentManager departments={departments} />
        </TabsContent>

        <TabsContent value="cost-centers" className="mt-4">
          <CostCenterManager costCenters={costCenters} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MemberManager members={members as any} />
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <ApprovalFlowList flows={flows} />
        </TabsContent>

        <TabsContent value="system" className="mt-4 space-y-6">
          {/* Tax Rules (read-only from YAML) */}
          <Card>
            <CardHeader>
              <CardTitle>กฎภาษี</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge>VAT {tax.vat.rate}%</Badge>
                <span className="ml-2 text-sm text-muted-foreground">{tax.vat.description}</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ประเภท WHT</TableHead>
                    <TableHead>อัตรา</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tax.wht.types.map((wht) => (
                    <TableRow key={wht.code}>
                      <TableCell className="font-medium">{wht.label}</TableCell>
                      <TableCell>{wht.rate}%</TableCell>
                      <TableCell className="text-muted-foreground">{wht.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Document Settings (read-only from YAML) */}
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าเอกสาร</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">รูปแบบเลขที่เอกสาร</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  {Object.entries(docSettings.document_numbering).map(([key, val]) => (
                    <div key={key} className="rounded-lg border p-3">
                      <p className="font-mono text-sm font-medium">{val.prefix}</p>
                      <p className="text-xs text-muted-foreground">{val.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">เงื่อนไขชำระเงิน</h4>
                <div className="flex flex-wrap gap-2">
                  {docSettings.payment_terms.map((term) => (
                    <Badge key={term.code} variant="outline">
                      {term.name} ({term.days} วัน)
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Requirements (read-only from YAML) */}
          <Card>
            <CardHeader>
              <CardTitle>เอกสารผู้ขาย</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เอกสาร</TableHead>
                    <TableHead>จำเป็น</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorReqs.vendor_documents.map((doc) => (
                    <TableRow key={doc.code}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge variant={doc.required ? "default" : "secondary"}>
                          {doc.required ? "จำเป็น" : "ไม่บังคับ"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{doc.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
