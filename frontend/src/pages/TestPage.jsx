import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const TestPage = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const handleClick = () => {
    setResult(`You entered: ${text} at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Page - Basic React State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something..."
              className="mb-2"
            />
            <Button type="button" onClick={handleClick}>
              Submit Test
            </Button>
          </div>
          
          {result && (
            <div className="p-4 bg-green-100 rounded">
              <strong>Result:</strong> {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
