import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;

class ChatPipeline {
    static task: any = 'text-generation';
    static model = 'Xenova/Qwen1.5-0.5B-Chat'; 
    static instance: any = null;

    static async getInstance(progress_callback?: (o: any) => void) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { 
                progress_callback,
                dtype: 'q4',
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, text } = event.data;

    if (type === 'init') {
        try {
            await ChatPipeline.getInstance((progress: any) => {
                self.postMessage({ status: 'progress', data: progress });
            });
            self.postMessage({ status: 'ready' });
        } catch (e: any) {
            self.postMessage({ status: 'error', error: e.message });
        }
        return;
    }

    if (type === 'generate') {
        try {
            const generator = await ChatPipeline.getInstance();
            
            const prompt = `<|im_start|>system\nСен Sentinel киберқауіпсіздік сарапшысысың. Қолданушының тек ИТ, киберқауіптер, вирустар бойынша сұрақтарына ғана қазақша жауап бер. Басқа тақырыпта (саясат, ауа-райы) кірсе "Мен тек қауіпсіздік бойынша жауап беремін" де. Жауап қысқа болсын.<|im_end|>\n<|im_start|>user\n${text}<|im_end|>\n<|im_start|>assistant\n`;
            
            const output = await generator(prompt, {
                max_new_tokens: 150,
                temperature: 0.5,
                do_sample: true,
            });

            const generatedText = output[0]?.generated_text || '';
            const parts = generatedText.split('<|im_start|>assistant\n');
            let assistantReply = parts.length > 1 ? parts[1] : generatedText;
            assistantReply = assistantReply.replace('<|im_end|>', '').trim();

            self.postMessage({ status: 'complete', result: assistantReply });

        } catch (e: any) {
             self.postMessage({ status: 'error', error: e.message });
        }
    }
});
