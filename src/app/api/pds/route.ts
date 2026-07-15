import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const applicationId = request.nextUrl.searchParams.get("application_id");
    if (!applicationId) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }

    const pds = await db.applicant_pds.findUnique({
      where: { application_id: applicationId },
    });

    return NextResponse.json(pds);
  } catch (error) {
    console.error("Get PDS error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { application_id, ...fields } = body;

    if (!application_id) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }

    const data = {
      last_name: fields.last_name ?? null,
      first_name: fields.first_name ?? null,
      middle_name: fields.middle_name ?? null,
      nickname: fields.nickname ?? null,
      present_address: fields.present_address ?? null,
      provincial_address: fields.provincial_address ?? null,
      how_often_visit_province: fields.how_often_visit_province ?? null,
      travel_time_minutes: fields.travel_time_minutes ?? null,
      residence_number: fields.residence_number ?? null,
      cellphone: fields.cellphone ?? null,
      email: fields.email ?? null,
      religion: fields.religion ?? null,
      desired_salary: fields.desired_salary ?? null,
      date_of_birth: fields.date_of_birth ? new Date(fields.date_of_birth) : null,
      place_of_birth: fields.place_of_birth ?? null,
      nationality: fields.nationality ?? null,
      sex: fields.sex ?? null,
      age: fields.age ?? null,
      height: fields.height ?? null,
      weight: fields.weight ?? null,
      civil_status: fields.civil_status ?? null,
      sss_number: fields.sss_number ?? null,
      tin: fields.tin ?? null,
      pagibig_number: fields.pagibig_number ?? null,
      philhealth_number: fields.philhealth_number ?? null,
      health_issues: fields.health_issues ?? null,
      father_name: fields.father_name ?? null,
      father_address: fields.father_address ?? null,
      father_occupation: fields.father_occupation ?? null,
      father_age: fields.father_age ?? null,
      father_na: fields.father_na ?? false,
      mother_name: fields.mother_name ?? null,
      mother_address: fields.mother_address ?? null,
      mother_occupation: fields.mother_occupation ?? null,
      mother_age: fields.mother_age ?? null,
      mother_na: fields.mother_na ?? false,
      spouse_name: fields.spouse_name ?? null,
      spouse_address: fields.spouse_address ?? null,
      spouse_occupation: fields.spouse_occupation ?? null,
      spouse_age: fields.spouse_age ?? null,
      spouse_na: fields.spouse_na ?? true,
      siblings: fields.siblings ?? [],
      siblings_na: fields.siblings_na ?? true,
      children: fields.children ?? [],
      has_relative_in_company: fields.has_relative_in_company ?? null,
      relatives: fields.relatives ?? [],
      elementary: fields.elementary ?? null,
      secondary: fields.secondary ?? null,
      college: fields.college ?? null,
      post_graduate: fields.post_graduate ?? null,
      vocational: fields.vocational ?? null,
      why_took_course: fields.why_took_course ?? null,
      licenses: fields.licenses ?? [],
      licenses_na: fields.licenses_na ?? true,
      gov_exams: fields.gov_exams ?? [],
      gov_exams_na: fields.gov_exams_na ?? true,
      trainings: fields.trainings ?? [],
      trainings_na: fields.trainings_na ?? true,
      activities: fields.activities ?? [],
      activities_na: fields.activities_na ?? true,
      special_skills: fields.special_skills ?? null,
      employment_record: fields.employment_record ?? [],
      character_references: fields.character_references ?? [],
      character_references_na: fields.character_references_na ?? true,
      emergency_name: fields.emergency_name ?? null,
      emergency_relationship: fields.emergency_relationship ?? null,
      emergency_telephone: fields.emergency_telephone ?? null,
      emergency_address: fields.emergency_address ?? null,
      declarations: fields.declarations ?? null,
      personality_profiling: fields.personality_profiling ?? null,
      work_preferences: fields.work_preferences ?? null,
      certify_truth_correctness: fields.certify_truth_correctness ?? false,
      signature_name: fields.signature_name ?? null,
      submitted_at: new Date(),
      updated_at: new Date(),
    };

    const pds = await db.applicant_pds.upsert({
      where: { application_id },
      update: data,
      create: { application_id, ...data },
    });

    return NextResponse.json(
      { message: "PDS saved successfully", pds },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save PDS error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}