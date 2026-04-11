<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_unknown_routes_return_not_found(): void
    {
        $response = $this->get('/this-route-does-not-exist');

        $response->assertStatus(404);
    }
}
