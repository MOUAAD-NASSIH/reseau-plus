import { User, Briefcase, FileText } from "lucide-react";
import { useWorkerRegisterStore } from "../workerRegister.store";
import { useGetDomainsQuery } from "@/features/api/endpoints/domainEndpoints";

import { ProfileSection } from "@/components/common/profile/ProfileSection";
import { ProfileItem } from "@/components/common/profile/ProfileItem";
import { DomainList } from "@/components/common/profile/DomainList";
import { DocumentList } from "@/components/common/profile/DocumentList";
import { ExperienceList } from "@/components/common/profile/ExperienceList";

export default function StepConfirm() {
  const { data } = useWorkerRegisterStore();
  const { data: domainsData } = useGetDomainsQuery();
  const domains = domainsData?.data || [];

  const domainNames =
    data.domainIds?.map((id: number) => domains.find((d) => d.id === id)?.name ?? "") ??
    [];

  return (
    <div className="space-y-14">
      <ProfileSection title="Personal information" icon={User}>
        <div className="grid grid-cols-2 gap-6">
          <ProfileItem
            label="Full name"
            value={`${data.firstName} ${data.lastName}`}
          />
          <ProfileItem label="Email" value={data.email} />
          <ProfileItem label="City" value={data.city} />
        </div>
      </ProfileSection>

      <ProfileSection title="Professional profile" icon={Briefcase}>
        <ProfileItem label="Speciality" value={`#${data.specialityId}`} />
        <ProfileItem label="Years of experience" value={data.experienceYears} />
        <DomainList domainNames={domainNames} />
      </ProfileSection>

      {data.experiences?.length && (
        <ProfileSection title="Professional experience">
          <ExperienceList experiences={data.experiences} />
        </ProfileSection>
      )}

      <ProfileSection title="Uploaded documents" icon={FileText}>
        <DocumentList
          documents={
            data.documents?.map((d: { type: string; file: File }) => ({
              type: d.type,
              fileName: d.file.name,
            })) ?? []
          }
        />
      </ProfileSection>
    </div>
  );
}

