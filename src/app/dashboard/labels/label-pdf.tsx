"use client";

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Label: 6cm x 4cm landscape, A4 grid: 3 cols x 4 rows (with margins)
const LABEL_W = 170; // ~6cm in points
const LABEL_H = 113; // ~4cm in points
const COLS = 3;
const ROWS = 4;

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 8,
  },
  label: {
    width: LABEL_W,
    height: LABEL_H,
    border: "1pt solid #ccc",
    borderRadius: 4,
    flexDirection: "row",
    padding: 6,
    gap: 6,
  },
  qr: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  institution: {
    fontSize: 6,
    color: "#666",
    marginBottom: 2,
  },
  code: {
    fontSize: 8,
    fontWeight: "bold",
  },
  name: {
    fontSize: 7,
    color: "#333",
  },
});

type AssetLabel = {
  id: string;
  assetCode: string;
  name: string;
};

type Props = {
  assets: AssetLabel[];
  qrDataUrls: Record<string, string>;
  institutionName: string;
};

function LabelDocument({ assets, qrDataUrls, institutionName }: Props) {
  const pages: AssetLabel[][] = [];
  const perPage = COLS * ROWS;

  for (let i = 0; i < assets.length; i += perPage) {
    pages.push(assets.slice(i, i + perPage));
  }

  return (
    <Document>
      {pages.map((pageAssets, pi) => (
        <Page key={pi} size="A4" style={styles.page}>
          {pageAssets.map((asset) => (
            <View key={asset.id} style={styles.label}>
              {qrDataUrls[asset.id] && (
                <Image src={qrDataUrls[asset.id]} style={styles.qr} />
              )}
              <View style={styles.info}>
                <Text style={styles.institution}>{institutionName}</Text>
                <Text style={styles.code}>{asset.assetCode}</Text>
                <Text style={styles.name}>
                  {asset.name.length > 40
                    ? asset.name.substring(0, 40) + "..."
                    : asset.name}
                </Text>
              </View>
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
}

export function LabelPdfPreview(props: Props) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PDFDownloadLink
          document={<LabelDocument {...props} />}
          fileName={`label-qr-${Date.now()}.pdf`}
        >
          {({ loading }) => (
            <Button variant="outline" disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      <div className="h-[600px] rounded-lg border">
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <LabelDocument {...props} />
        </PDFViewer>
      </div>
    </div>
  );
}
