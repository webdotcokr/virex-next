import { NextRequest, NextResponse } from 'next/server';
import { CSVTemplateGenerator } from '@/lib/CSVTemplateGenerator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('category');
    const includeSample = searchParams.get('sample') === 'true';
    const format = searchParams.get('format') || 'csv'; // csv or info

    if (!categoryName) {
      return NextResponse.json(
        { error: 'Category name is required' }, 
        { status: 400 }
      );
    }

    // Return template information only
    if (format === 'info') {
      const templateInfo = CSVTemplateGenerator.getTemplateInfo(categoryName);
      return NextResponse.json(templateInfo);
    }

    // Generate CSV content
    const csvContent = CSVTemplateGenerator.generateCSVContent(categoryName, includeSample);
    const fileName = `${categoryName.toLowerCase().replace(/\s+/g, '_')}_template.csv`;

    // Return CSV file for download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('CSV Template Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV template' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: 'Categories array is required' }, 
        { status: 400 }
      );
    }

    // Generate template information for multiple categories
    const templatesInfo = categories.map(categoryName => {
      const info = CSVTemplateGenerator.getTemplateInfo(categoryName);
      const hasTemplate = CSVTemplateGenerator.hasTemplate(categoryName);
      
      return {
        ...info,
        hasTemplate,
        templateAvailable: hasTemplate,
      };
    });

    return NextResponse.json({
      templates: templatesInfo,
      availableTemplateKeys: CSVTemplateGenerator.getAllTemplateKeys(),
    });

  } catch (error) {
    console.error('CSV Template Info Error:', error);
    return NextResponse.json(
      { error: 'Failed to get template information' }, 
      { status: 500 }
    );
  }
}