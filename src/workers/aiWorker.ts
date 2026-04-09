import { pipeline, env } from '@huggingface/transformers';

// Disable local models to fetch directly from HF Hub
env.allowLocalModels = false;

class PipelineSingleton {
    static task: any = 'zero-shot-classification';
    static model = 'Xenova/mobilebert-uncased-mnli';
    static instance: any = null;

    static async getInstance(progress_callback?: (progressInfo: any) => void) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { 
                progress_callback,
                dtype: 'fp32' // standard for web worker
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { text, type } = event.data;

    if (type === 'init') {
        try {
            await PipelineSingleton.getInstance((x: any) => {
                self.postMessage({ status: 'progress', item: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (e: any) {
            self.postMessage({ status: 'error', error: e.message });
        }
        return;
    }

    if (type === 'analyze') {
        try {
            const classifier = await PipelineSingleton.getInstance();
            const labels = [
                'safe and secure content', 
                'phishing, scam, or steal password', 
                'online casino, gambling, betting', 
                'illegal, darknet, drugs, weapon'
            ];
            
            const output = await classifier(text, labels);

            self.postMessage({
                status: 'complete',
                result: output
            });
        } catch (e: any) {
             self.postMessage({ status: 'error', error: e.message });
        }
    }
});
