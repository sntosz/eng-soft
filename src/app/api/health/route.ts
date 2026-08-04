import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    console.log("Testing Supabase connection...");
    
    // Test with generic query first
    const { data: testData, error: testError } = await supabaseAdmin
      .from("membros")
      .select("*")
      .limit(1);

    if (testError) {
      console.error("Test query error:", testError);
      return NextResponse.json({ 
        error: "Database error", 
        details: testError.message,
        code: testError.code 
      }, { status: 500 });
    }

    console.log("Test query successful, data:", testData);

    return NextResponse.json({ 
      status: "ok", 
      message: "Supabase connection is working",
      sampleData: testData 
    });
  } catch (err: any) {
    console.error("Health check error:", err);
    return NextResponse.json({ 
      error: "Health check failed", 
      details: err.message 
    }, { status: 500 });
  }
}
