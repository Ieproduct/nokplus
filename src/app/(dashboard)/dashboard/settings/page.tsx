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
import { getRolePermissions } from "@/lib/actions/permission";
import { CompanyForm } from "@/components/settings/company-form";
import { DepartmentManager } from "@/components/settings/department-manager";
import { CostCenterManager } from "@/components/settings/cost-center-manager";
import { MemberManager } from "@/components/settings/member-manager";
import { ApprovalFlowList } from "@/components/settings/approval-flow-list";
import { PermissionManager } from "@/components/settings/permission-manager";
import { Settings } from "lucide-react";

const VALID_TABS = ["company", "departments", "cost-centers", "members", "approvals", "system", "permissions"] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const requestedTab = params.tab || "company";
  const defaultTab = VALID_TABS.includes(requestedTab as typeof VALID_TABS[number])
    ? requestedTab
    : "company";

  const [company, departments, costCenters, members, flows, rolePermissions] = await Promise.all([
    getActiveCompany(),
    getAllDepartments(),
    getAllCostCenters(),
    getCompanyMembers(),
    getApprovalFlows(),
    getRolePermissions(),
  ]);

  const tax = getTaxRulesConfig();
  const docSettings = getDocumentSettingsConfig();
  const vendorReqs = getVendorRequirementsConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nok-blue/10">
          <Settings className="h-5 w-5 text-nok-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-nok-navy">ตั้งค่าระบบ</h1>
          <p className="text-muted-foreground text-sm">
            จัดการข้อมูลบริษัท แผนก สมาชิก และระบบอนุมัติ
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="company" className="data-[state=active]:bg-nok-blue data-[state=active]:text-white">ข้อมูลบริษัท</TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-nok-blue data-[state=active]:text-white">แผนก</TabsTrigger>
          <TabsTrigger value="cost-centers" className="data-[state=active]:bg-nok-blue data-[state=active]:text-white">Cost Center</TabsTrigger>
          <TabsTrigger value="members" className="data-[state=active]:bg-nok-blue data-[state=active]:text-white">สมาชิก</TabsTrigger>
          <TabsTrigger value="approvals" className="data-[state=active]:bg-nok-blue data-[state=active]:text-white">ระบบอนุมัติ</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-nok-blue data-[state=active]:text-white">ภาษี/เอกสาร</TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-nok-blue data-[state=active]:text-white">สิทธิ์ผู้ใช้งาน</TabsTrigger>
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

        <TabsContent value="permissions" className="mt-4">
          <PermissionManager rolePermissions={rolePermissions} />
        </TabsContent>

        <TabsContent value="system" className="mt-4 space-y-6">
          {/* Tax Rules */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-linear-to-r from-nok-navy to-nok-blue text-white">
              <CardTitle className="text-white">กฎภาษี</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <Badge className="bg-nok-blue text-white">VAT {tax.vat.rate}%</Badge>
                <span className="ml-2 text-sm text-muted-foreground">{tax.vat.description}</span>
              </div>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="nok-table-header hover:bg-transparent">
                      <TableHead>ประเภท WHT</TableHead>
                      <TableHead>อัตรา</TableHead>
                      <TableHead>คำอธิบาย</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tax.wht.types.map((wht) => (
                      <TableRow key={wht.code}>
                        <TableCell className="font-medium">{wht.label}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{wht.rate}%</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{wht.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Document Settings */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-linear-to-r from-nok-navy to-nok-blue text-white">
              <CardTitle className="text-white">ตั้งค่าเอกสาร</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <h4 className="font-medium mb-2 text-nok-navy">รูปแบบเลขที่เอกสาร</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  {Object.entries(docSettings.document_numbering).map(([key, val]) => (
                    <div key={key} className="rounded-xl border-2 border-transparent bg-blue-50/50 p-3">
                      <p className="font-mono text-sm font-bold text-nok-blue">{val.prefix}</p>
                      <p className="text-xs text-muted-foreground">{val.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-nok-navy">เงื่อนไขชำระเงิน</h4>
                <div className="flex flex-wrap gap-2">
                  {docSettings.payment_terms.map((term) => (
                    <Badge key={term.code} variant="outline" className="text-nok-blue border-nok-blue/30">
                      {term.name} ({term.days} วัน)
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Requirements */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-linear-to-r from-nok-navy to-nok-blue text-white">
              <CardTitle className="text-white">เอกสารผู้ขาย</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="nok-table-header hover:bg-transparent">
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
                          <Badge className={doc.required ? "bg-nok-blue text-white" : "bg-gray-100 text-gray-600"}>
                            {doc.required ? "จำเป็น" : "ไม่บังคับ"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{doc.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
