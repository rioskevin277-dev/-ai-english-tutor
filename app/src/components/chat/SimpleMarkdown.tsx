import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface SimpleMarkdownProps {
  text: string;
}

/**
 * Simple markdown renderer that handles **bold**, `code`, and newlines.
 * No native dependencies — pure React Native.
 */
export default function SimpleMarkdown({ text }: SimpleMarkdownProps) {
  const segments = parseMarkdown(text);

  return (
    <Text style={styles.base}>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'bold':
            return (
              <Text key={i} style={styles.bold}>
                {seg.content}
              </Text>
            );
          case 'code':
            return (
              <Text key={i} style={styles.code}>
                {seg.content}
              </Text>
            );
          case 'codeBlock':
            return (
              <View key={i} style={styles.codeBlock}>
                <Text style={styles.codeBlockText}>{seg.content}</Text>
              </View>
            );
          default:
            return <Text key={i}>{seg.content}</Text>;
        }
      })}
    </Text>
  );
}

type Segment =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'code'; content: string }
  | { type: 'codeBlock'; content: string };

function parseMarkdown(text: string): Segment[] {
  const segments: Segment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Code block (```...```)
    const codeBlockMatch = remaining.match(/^```(\w*)\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      if (codeBlockMatch.index === 0) {
        segments.push({ type: 'codeBlock', content: codeBlockMatch[2].trim() });
        remaining = remaining.slice(codeBlockMatch[0].length);
        continue;
      }
    }

    // Inline code (`...`)
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      segments.push({ type: 'code', content: codeMatch[1] });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold (**...**)
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      segments.push({ type: 'bold', content: boldMatch[1] });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Regular text until next marker
    const nextMarker = remaining.search(/(\*\*|`|```)/);
    if (nextMarker === 0) {
      // Shouldn't happen since we already checked, but just in case
      remaining = remaining.slice(1);
    } else if (nextMarker > 0) {
      segments.push({ type: 'text', content: remaining.slice(0, nextMarker) });
      remaining = remaining.slice(nextMarker);
    } else {
      segments.push({ type: 'text', content: remaining });
      remaining = '';
    }
  }

  return segments;
}

const styles = StyleSheet.create({
  base: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    color: '#ff6b6b',
    fontWeight: '700',
  },
  code: {
    backgroundColor: '#0f3460',
    color: '#e94560',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  codeBlock: {
    backgroundColor: '#0f3460',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  codeBlockText: {
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: 13,
  },
});
