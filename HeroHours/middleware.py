import time


class TimeItMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        response = self.get_response(request)

        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"View {request.path} runtime: {elapsed_time} seconds")

        return response